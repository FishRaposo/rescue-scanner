import Link from "next/link";
import { api } from "../../lib/api";
import { RULE_LIMITS, type ScanReport } from "../../lib/report";

export default async function RulesPage() {
  const report = await api.get<ScanReport>("/api/scan");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm">
        <Link prefetch={false} href="/" className="text-accent underline">
          ← report
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold">Rules applied ({report.rules.length})</h1>
      <p className="mt-2 text-sm text-muted">
        Each rule is a deliberate heuristic over source text. Every one ships
        with a known blind spot — listed below — which is why the report calls
        itself an engineering review, not a certification.
      </p>
      <ul className="mt-6 space-y-6">
        {report.rules.map((r) => (
          <li key={r.id} className="rounded border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <code className="font-semibold">{r.id}</code>
              <span className="text-xs uppercase text-muted">
                {r.severity} severity · {r.confidence} confidence
              </span>
            </div>
            <p className="mt-2 text-sm">{r.description}</p>
            <p className="mt-2 text-sm text-warning">
              <strong>Cannot see:</strong> {RULE_LIMITS[r.id]}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
