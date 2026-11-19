import { describe, expect, it } from "vitest";
import { scan } from "./scan.ts";
import fs from "node:fs";
import path from "node:path";

const BAD = path.resolve("fixtures/bad-app");
const CLEAN = path.resolve("fixtures/clean-app");
const bad = scan(BAD);
const clean = scan(CLEAN);

const rulesIn = (report: typeof bad) => new Set(report.findings.map((f) => f.ruleId));

describe("bad-app fixture", () => {
  it("every rule fires", () => {
    const rules = rulesIn(bad);
    for (const id of [
      "server-secret-in-client",
      "missing-rls",
      "boundary-leak",
      "unsafe-api-route",
      "missing-auth-check",
      "deploy-misconfig",
      "env-misconfig",
      "missing-test",
    ]) {
      expect(rules, `rule ${id}`).toContain(id);
    }
  });

  it("flags the permissive USING (true) policy at high confidence", () => {
    const f = bad.findings.find((x) => x.evidence.includes("using (true)"));
    expect(f?.severity).toBe("high");
    expect(f?.confidence).toBe("high");
  });

  it("flags the orders table (no RLS) but not payments (RLS enabled)", () => {
    const rls = bad.findings.filter((f) => f.ruleId === "missing-rls" && f.evidence.startsWith("create table"));
    expect(rls).toHaveLength(1);
    expect(rls[0]!.evidence).toContain("orders");
  });

  it("ranked high-severity first", () => {
    const sevs = bad.findings.map((f) => f.severity);
    const order = { high: 0, medium: 1, low: 2 } as const;
    for (let i = 1; i < sevs.length; i++) {
      const cur = sevs[i]!;
      const prev = sevs[i - 1]!;
      expect(order[cur]).toBeGreaterThanOrEqual(order[prev]);
    }
  });
});

describe("clean-app fixture (false-positive gate)", () => {
  it("has zero findings", () => {
    expect(clean.findings, JSON.stringify(clean.findings, null, 2)).toHaveLength(0);
  });
  it("scanned the files (guard against empty-tree false clean)", () => {
    expect(clean.filesScanned).toBeGreaterThan(5);
  });
  it("covers the known FP classes (regression: env-backed/test-infra/docs-string)", () => {
    // Each known-FP shape exists in the fixture; the zero-findings gate above
    // proves none of them fires. Presence checks guard the fixture from
    // drifting away from what it is meant to prove.
    expect(fs.readFileSync(`${CLEAN}/lib/config.ts`, "utf-8")).toContain('?? "http://localhost:4000"');
    expect(fs.readFileSync(`${CLEAN}/lib/docs-strings.ts`, "utf-8")).toContain("http://localhost:3000");
    expect(fs.existsSync(`${CLEAN}/playwright.config.ts`)).toBe(true);
    expect(fs.existsSync(`${CLEAN}/e2e/serve.mjs`)).toBe(true);
  });
});
