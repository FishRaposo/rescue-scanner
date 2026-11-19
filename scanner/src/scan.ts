import { RULES } from "./rules.ts";
import { SEVERITY_ORDER, type ScanReport } from "./types.ts";
import { walk } from "./walk.ts";
import path from "node:path";

export const VERSION = "0.1.0";

export function scan(root: string): ScanReport {
  const abs = path.resolve(root);
  const ctx = walk(abs);
  const findings = [];
  for (const rule of RULES) {
    if (rule.checkFile) for (const f of ctx.files) findings.push(...rule.checkFile(f, ctx));
    if (rule.checkRepo) findings.push(...rule.checkRepo(ctx));
  }
  findings.sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.ruleId.localeCompare(b.ruleId) ||
      a.path.localeCompare(b.path) ||
      a.line - b.line,
  );
  return {
    tool: "rescue-scanner",
    version: VERSION,
    repo: path.basename(abs),
    revision: ctx.revision,
    scannedAt: new Date().toISOString(),
    filesScanned: ctx.files.length,
    rules: RULES.map((r) => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      confidence: r.confidence,
      description: r.description,
    })),
    counts: {
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length,
    },
    findings,
  };
}
