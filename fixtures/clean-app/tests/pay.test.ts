import { describe, it, expect } from "vitest";
import { POST } from "../app/api/pay/route";

describe("pay route", () => {
  it("rejects invalid input", async () => {
    const res = await POST(new Request("http://x", { method: "POST", body: "{}" }));
    expect(res.status).toBe(400);
  });
});
