import { describe, expect, it } from "vitest";
import { build, makeContext } from "./builders";
import { parseScenario, ScenarioFormatError } from "./load";

describe("deterministic builders", () => {
  it("same seed produces the same ids", () => {
    const a = makeContext(7);
    const b = makeContext(7);
    expect([a.id("t"), a.id("t"), a.id("u")]).toEqual([b.id("t"), b.id("t"), b.id("u")]);
    expect(a.id("t")).toBe("t-0003");
  });

  it("build fills defaults and uses context ids", () => {
    const ctx = makeContext(1);
    const item = build(ctx, "item", () => ({ title: "x", status: "open" }));
    expect(item).toEqual({ id: "item-0001", title: "x", status: "open" });
  });
});

describe("parseScenario", () => {
  it("accepts a valid scenario", () => {
    const s = parseScenario(
      JSON.stringify({
        scenario: "x",
        version: 1,
        seed: 3,
        generated_at: "2026-01-01T00:00:00Z",
        entities: { items: [{ id: "i-1" }] },
      }),
    );
    expect(s.entities["items"]).toHaveLength(1);
  });

  it("rejects malformed files loudly", () => {
    expect(() => parseScenario("not json")).toThrow(ScenarioFormatError);
    expect(() => parseScenario("{}")).toThrow(ScenarioFormatError);
    expect(() =>
      parseScenario(
        JSON.stringify({
          scenario: "x",
          version: 1,
          seed: 1,
          generated_at: "t",
          entities: { items: [{ title: "no id" }] },
        }),
      ),
    ).toThrow(ScenarioFormatError);
  });
});
