/**
 * Report data layer. The report is static by design: it renders the committed
 * scan of the bundled fixture repo (fixtures/scans/bad-app.scan.json), so the
 * demo, the local run and CI all see identical data.
 *
 * Finding deep links use compact slugs (f-01, f-02, …) because raw finding
 * ids contain `:` and `/` which do not survive static-export paths.
 */
import scanJson from "../../fixtures/scans/bad-app.scan.json";

export type Severity = "high" | "medium" | "low";

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: string;
  path: string;
  line: number;
  evidence: string;
  remediation: string;
}

export interface ScanReport {
  tool: string;
  version: string;
  repo: string;
  revision: string | null;
  scannedAt: string;
  filesScanned: number;
  rules: { id: string; title: string; severity: Severity; confidence: string; description: string }[];
  counts: Record<Severity, number>;
  findings: Finding[];
}

export const report = scanJson as ScanReport;

export function slugFor(index: number): string {
  return `f-${String(index + 1).padStart(2, "0")}`;
}

export function indexFor(slug: string): number {
  const n = Number(slug.replace(/^f-/, ""));
  return Number.isInteger(n) && n >= 1 ? n - 1 : -1;
}

export const findingsBySlug = new Map(
  report.findings.map((f, i) => [slugFor(i), f] as const),
);

export function findingFor(slug: string): Finding | null {
  return findingsBySlug.get(slug) ?? null;
}

/** Rule id -> one-line "what this rule cannot see" limit. */
export const RULE_LIMITS: Record<string, string> = {
  "server-secret-in-client":
    "Cannot see secrets reached through indirection (a server file that re-exports to a client file, or a secret smuggled via a prop).",
  "missing-rls":
    "Cannot see RLS enabled outside migrations (Supabase dashboard changes, seed scripts), and cannot judge whether a policy predicate is *correct* — only that one exists.",
  "boundary-leak":
    "Only checks direct imports in client files; a server helper imported into a server file that is itself imported client-side is not followed.",
  "unsafe-api-route":
    "Flags the absence of a recognizable validator, not a wrong schema — a schema that validates nothing still passes this rule.",
  "missing-auth-check":
    "Knows a fixed set of protected prefixes and auth-call shapes; middleware-level auth is only credited when the file or layout mentions it.",
  "deploy-misconfig":
    "Matches URL-shaped strings only; a host assembled from variables, or a local URL in a comment, is not seen.",
  "env-misconfig":
    "Only reads process.env.NAME references; destructured env objects and env used in config files outside the scanned roots are missed.",
  "missing-test":
    "Checks for a same-named test/spec file anywhere in the repo — it cannot judge whether the test actually exercises the route.",
};
