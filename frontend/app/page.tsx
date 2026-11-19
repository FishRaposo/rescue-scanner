import Link from "next/link";
import { SampleDataBadge } from "@shared/ui";
import { api } from "../lib/api";
import { slugFor, type Severity, type ScanReport } from "../lib/report";

const SEV_STYLE: Record<Severity, string> = {
  high: "bg-red-700 text-white",
  medium: "bg-amber-600 text-white",
  low: "bg-blue-700 text-white",
};

export default async function ReportHome() {
  const report = await api.get<ScanReport>("/api/scan");
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Rescue Scanner report</h1>
          <SampleDataBadge note="scan of the bundled bad-app fixture" />
        </div>
        <p className="mt-1 text-sm text-muted">
          repo <code>{report.repo}</code> · revision{" "}
          <code>{report.revision ?? "n/a"}</code> · scanned{" "}
          {new Date(report.scannedAt).toUTCString()} · {report.filesScanned} files ·{" "}
          {report.findings.length} findings
        </p>
      </header>

      <section aria-label="Severity counts" className="mb-6 flex gap-3">
        {(["high", "medium", "low"] as const).map((s) => (
          <div key={s} className="rounded border px-4 py-3 text-center">
            <div className="text-2xl font-bold">{report.counts[s]}</div>
            <div className={`mt-1 rounded px-2 py-0.5 text-xs uppercase ${SEV_STYLE[s]}`}>{s}</div>
          </div>
        ))}
      </section>

      <div className="mb-6 rounded-md border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>Scope limit:</strong> static source review ranked by heuristic
        rules. This is an engineering review, not a security certification or a
        penetration test — it can miss real defects and can flag safe code.
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-3">severity</th>
            <th className="py-2 pr-3">rule</th>
            <th className="py-2 pr-3">location</th>
            <th className="py-2 pr-3">evidence</th>
            <th className="py-2" aria-label="detail" />
          </tr>
        </thead>
        <tbody>
          {report.findings.map((f, i) => (
            <tr key={f.id} className="border-b align-top">
              <td className="py-2 pr-3">
                <span className={`rounded px-2 py-0.5 text-xs uppercase ${SEV_STYLE[f.severity]}`}>
                  {f.severity}
                </span>
              </td>
              <td className="py-2 pr-3">
                <code className="text-xs">{f.ruleId}</code>
                <div className="text-muted">{f.title}</div>
              </td>
              <td className="py-2 pr-3">
                <code className="text-xs">
                  {f.path}:{f.line}
                </code>
              </td>
              <td className="max-w-md py-2 pr-3">
                <code className="block truncate text-xs">{f.evidence}</code>
              </td>
              <td className="py-2">
                <Link
                  prefetch={false}
                  href={`/findings/${slugFor(i)}/`}
                  className="text-blue-700 underline"
                >
                  detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav className="mt-8 text-sm">
        <Link prefetch={false} href="/rules/" className="text-blue-700 underline">
          Rules applied and what each cannot see →
        </Link>
      </nav>
    </main>
  );
}
