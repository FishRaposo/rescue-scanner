import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BIN = path.resolve("scanner/bin.mjs");

function run(args: string[]): { code: number; out: string } {
  try {
    const out = execFileSync("node", [BIN, ...args], { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status: number; stdout?: string; stderr?: Buffer };
    return { code: err.status, out: (err.stdout ?? "") + (err.stderr?.toString() ?? "") };
  }
}

describe("cli", () => {
  it("scan bad-app exits 2 on default fail-on high", () => {
    expect(run(["scan", "fixtures/bad-app"]).code).toBe(2);
  });
  it("scan clean-app exits 0", () => {
    const r = run(["scan", "fixtures/clean-app"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("no findings");
  });
  it("--fail-on never exits 0 even with high findings", () => {
    expect(run(["scan", "fixtures/bad-app", "--fail-on", "never"]).code).toBe(0);
  });
  it("--format json emits a stable report shape", () => {
    const r = run(["scan", "fixtures/bad-app", "--format", "json", "--fail-on", "never"]);
    expect(r.code).toBe(0);
    const report = JSON.parse(r.out);
    expect(report.tool).toBe("rescue-scanner");
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.counts.high).toBeGreaterThan(0);
  });
  it("--out writes an html report", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "rs-"));
    const out = path.join(dir, "r.html");
    run(["scan", "fixtures/bad-app", "--format", "html", "--out", out, "--fail-on", "never"]);
    expect(existsSync(out)).toBe(true);
    const html = readFileSync(out, "utf-8");
    expect(html).toContain("Rescue Scanner report");
    expect(html).toContain("not a security certification");
  });
  it("usage error exits 1", () => {
    expect(run(["scan"]).code).toBe(1);
    expect(run(["frobnicate"]).code).toBe(1);
  });
  it("rules lists the 8 rules", () => {
    const r = run(["rules"]);
    expect(r.code).toBe(0);
    expect(r.out.trim().split("\n")).toHaveLength(8);
  });
});
