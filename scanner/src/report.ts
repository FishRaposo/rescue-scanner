import type { Finding, ScanReport } from "./types.ts";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SEV_COLOR: Record<Finding["severity"], string> = {
  high: "#b91c1c",
  medium: "#b45309",
  low: "#1d4ed8",
};

function findingRow(f: Finding): string {
  return `<tr>
  <td><span class="sev" style="background:${SEV_COLOR[f.severity]}">${f.severity}</span></td>
  <td><code>${esc(f.ruleId)}</code><div class="title">${esc(f.title)}</div></td>
  <td><code>${esc(f.path)}:${f.line}</code></td>
  <td class="conf">${f.confidence}</td>
  <td><pre>${esc(f.evidence)}</pre><div class="fix">${esc(f.remediation)}</div></td>
</tr>`;
}

/** Self-contained HTML report; no external assets, no requests. */
export function toHtml(report: ScanReport): string {
  const rows = report.findings.map(findingRow).join("\n");
  const ruleList = report.rules
    .map((r) => `<li><code>${esc(r.id)}</code> — ${esc(r.title)} <em>(${r.severity}/${r.confidence})</em></li>`)
    .join("\n");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rescue Scanner — ${esc(report.repo)}</title>
<style>
body{font-family:ui-monospace,Menlo,Consolas,monospace;margin:2rem auto;max-width:1100px;padding:0 1rem;color:#111;line-height:1.45}
h1{font-size:1.4rem}table{border-collapse:collapse;width:100%;font-size:.85rem}
td,th{border:1px solid #ddd;padding:.45rem .6rem;text-align:left;vertical-align:top}
th{background:#f4f4f5}.sev{color:#fff;border-radius:3px;padding:.1rem .45rem;font-size:.75rem}
pre{white-space:pre-wrap;margin:.2rem 0 .35rem;background:#f8f8f8;padding:.3rem .45rem;border-radius:4px}
.fix{color:#374151;font-family:system-ui,sans-serif;font-size:.82rem}
.title{color:#374151;font-family:system-ui,sans-serif}.conf{text-transform:capitalize}
.meta{color:#52525b;font-family:system-ui,sans-serif}.limit{border:1px solid #f59e0b;background:#fffbeb;padding:.7rem 1rem;border-radius:6px;font-family:system-ui,sans-serif;font-size:.85rem}
.rules{font-family:system-ui,sans-serif;font-size:.85rem}
</style></head><body>
<h1>Rescue Scanner report</h1>
<p class="meta">repo <code>${esc(report.repo)}</code> · revision <code>${esc(report.revision ?? "n/a")}</code> ·
scanned ${esc(report.scannedAt)} · ${report.filesScanned} files · ${report.findings.length} findings
(<strong>${report.counts.high}</strong> high / ${report.counts.medium} medium / ${report.counts.low} low)</p>
<div class="limit"><strong>Scope limit:</strong> static source review of this repository, ranked by
heuristic rules. This is an engineering review, not a security certification or a penetration test —
it can miss real defects and can flag safe code.</div>
<table><thead><tr><th>severity</th><th>rule</th><th>location</th><th>confidence</th><th>evidence &amp; remediation</th></tr></thead>
<tbody>
${rows || '<tr><td colspan="5"><em>No findings — within the limits of the rules below.</em></td></tr>'}
</tbody></table>
<h2>Rules applied (${report.rules.length})</h2>
<ul class="rules">${ruleList}</ul>
</body></html>`;
}
