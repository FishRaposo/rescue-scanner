/**
 * Rescue Scanner — finding model and rule types.
 *
 * The scanner reads repository source only. A `Rule` examines one file at a
 * time (plus a small repo context) and returns zero or more findings. Rules
 * are regex/heuristic based by design: this is an engineering-review tool,
 * not a full SAST, and docs/RULES.md documents each rule's known
 * false-positive shape.
 */

export type Severity = "high" | "medium" | "low";
export type Confidence = "high" | "medium" | "low";

export const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export interface SourceFile {
  /** Repo-relative POSIX path, e.g. `app/api/pay/route.ts`. */
  path: string;
  /** File contents, UTF-8. */
  text: string;
  /** Heuristic file classification used by rules. */
  kind: FileKind;
  /** True when the file starts with a `"use client"` directive. */
  isClient: boolean;
  /** Line index for fast lookup (0-based offsets of line starts). */
  lineStarts: number[];
}

export type FileKind =
  | "client-component"
  | "server-component"
  | "route-handler"
  | "sql-migration"
  | "env-example"
  | "test"
  | "source"
  | "other";

export interface RepoContext {
  /** Absolute path of the scanned directory. */
  root: string;
  /** Short git revision, or null when unavailable. */
  revision: string | null;
  /** All scanned source files. */
  files: SourceFile[];
  /** Repo-relative paths for whole-repo checks (e.g. env key presence). */
  paths: Set<string>;
}

export interface Finding {
  /** Stable finding id: `<ruleId>:<path>:<line>`. */
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  path: string;
  line: number;
  /** The matched source line, trimmed. */
  evidence: string;
  /** Concrete remediation step or safe patch. */
  remediation: string;
}

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  /** One-line description for the report. */
  description: string;
  /**
   * File-level check. Return findings for this file; return [] when the file
   * is not applicable.
   */
  checkFile?(file: SourceFile, ctx: RepoContext): Finding[];
  /**
   * Repo-level check run once per scan (for rules that need cross-file
   * knowledge such as "env key used but absent from .env.example").
   */
  checkRepo?(ctx: RepoContext): Finding[];
}

export interface ScanReport {
  tool: "rescue-scanner";
  version: string;
  repo: string;
  revision: string | null;
  scannedAt: string;
  filesScanned: number;
  rules: { id: string; title: string; severity: Severity; confidence: Confidence; description: string }[];
  counts: Record<Severity, number>;
  findings: Finding[];
}

/** Line number (1-based) for a character offset. */
export function lineOf(file: SourceFile, offset: number): number {
  const starts = file.lineStarts;
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid]! <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

/** The trimmed source line containing `offset`, capped for evidence. */
export function evidenceLine(file: SourceFile, offset: number): string {
  const n = lineOf(file, offset) - 1;
  const start = file.lineStarts[n];
  const end = file.lineStarts[n + 1] ?? file.text.length;
  return file.text.slice(start, end).trim().slice(0, 200);
}

export function finding(
  file: SourceFile,
  rule: Rule,
  offset: number,
  opts: Partial<Pick<Finding, "severity" | "confidence" | "evidence" | "remediation">> & { remediation: string },
): Finding {
  const line = lineOf(file, offset);
  return {
    id: `${rule.id}:${file.path}:${line}`,
    ruleId: rule.id,
    title: rule.title,
    severity: opts.severity ?? rule.severity,
    confidence: opts.confidence ?? rule.confidence,
    path: file.path,
    line,
    evidence: opts.evidence ?? evidenceLine(file, offset),
    remediation: opts.remediation,
  };
}

/** All matches of `re` over `file.text` as `[offset, match]` pairs. */
export function* matches(file: SourceFile, re: RegExp): Generator<[number, RegExpExecArray]> {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(file.text)) !== null) {
    yield [m.index, m];
    if (m.index === re.lastIndex) re.lastIndex++;
  }
}
