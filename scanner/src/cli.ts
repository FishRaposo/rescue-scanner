/**
 * rescue-scanner scan <path> [--format text|json|html] [--out <file>] [--fail-on <sev>]
 *
 * Exit codes: 0 = clean or below threshold, 2 = findings at/above --fail-on
 * (default high), 1 = usage/error.
 */
import { writeFileSync } from "node:fs";
import { scan, VERSION } from "./scan.ts";
import { RULES } from "./rules.ts";
import { toHtml } from "./report.ts";
import { SEVERITY_ORDER, type Severity, type ScanReport } from "./types.ts";

const USAGE = `rescue-scanner ${VERSION}

  rescue-scanner scan <path> [--format text|json|html] [--out <file>] [--fail-on high|medium|low|never]
  rescue-scanner rules
  rescue-scanner --version

  --format   output format (default: text)
  --out      write to file instead of stdout
  --fail-on  exit code 2 when findings at or above this severity exist (default: high)`;

export function main(argv: string[]): number {
  const args = [...argv];
  const cmd = args.shift();
  if (cmd === "--version" || cmd === "-v") {
    console.log(VERSION);
    return 0;
  }
  if (cmd === "rules") {
    for (const r of RULES) console.log(`${r.id}\t${r.severity}/${r.confidence}\t${r.title}`);
    return 0;
  }
  if (cmd !== "scan") {
    console.error(USAGE);
    return 1;
  }
  const target = args.shift();
  if (!target) {
    console.error("scan needs a path\n" + USAGE);
    return 1;
  }
  let format = "text";
  let out: string | null = null;
  let failOn: Severity | "never" = "high";
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--format") format = args[++i] ?? format;
    else if (a === "--out") out = args[++i] ?? null;
    else if (a === "--fail-on") failOn = (args[++i] ?? "high") as Severity | "never";
  }
  if (!["text", "json", "html"].includes(format)) {
    console.error(`unknown --format ${format}`);
    return 1;
  }
  if (!SEVS.includes(failOn as Severity) && failOn !== "never") {
    console.error(`unknown --fail-on ${failOn}`);
    return 1;
  }
  let report: ScanReport;
  try {
    report = scan(target);
  } catch (e) {
    console.error(`scan failed: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
  const body =
    format === "json" ? JSON.stringify(report, null, 2) : format === "html" ? toHtml(report) : toText(report);
  if (out) writeFileSync(out, body);
  else process.stdout.write(body + "\n");
  if (failOn === "never") return 0;
  const worst = Math.min(...report.findings.map((f) => SEVERITY_ORDER[f.severity]), 99);
  return worst <= SEVERITY_ORDER[failOn] ? 2 : 0;
}

const SEVS: Severity[] = ["high", "medium", "low"];

function toText(report: ScanReport): string {
  const lines: string[] = [];
  lines.push(`rescue-scanner ${VERSION} — ${report.repo}@${report.revision ?? "n/a"} — ${report.filesScanned} files`);
  lines.push(`findings: ${report.counts.high} high / ${report.counts.medium} medium / ${report.counts.low} low`);
  for (const f of report.findings) {
    lines.push("");
    lines.push(`[${f.severity}/${f.confidence}] ${f.ruleId} — ${f.title}`);
    lines.push(`  ${f.path}:${f.line}`);
    lines.push(`  evidence: ${f.evidence}`);
    lines.push(`  fix: ${f.remediation}`);
  }
  if (!report.findings.length) lines.push("no findings (within the documented rule limits)");
  return lines.join("\n");
}
