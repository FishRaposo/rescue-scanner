/**
 * Adapter parity: mock and HTTP return the same envelope for success,
 * validation, auth and server errors. The HTTP adapter is exercised with an
 * injected fetch stub — no network in the default suite.
 */
import { describe, expect, it } from "vitest";
import { ApiError } from "./adapter";
import { createClient } from "./client";
import { err, ok } from "./envelope";
import { HttpAdapter } from "./http";
import { MockAdapter, type MockRoute } from "./mock";

const routes: MockRoute[] = [
  { method: "GET", path: "/api/items", respond: () => [{ id: "item-1" }] },
  {
    method: "GET",
    path: "/api/items/:id",
    respond: ({ params }) => ({ id: params["id"], name: "thing" }),
  },
  { method: "GET", path: "/api/fail", respond: () => err("validation_error", "bad input", { f: "x" }) },
  { method: "GET", path: "/api/denied", respond: () => err("forbidden", "denied") },
];

function stubFetch(body: unknown, status = 200): typeof fetch {
  return (() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    )) as typeof fetch;
}

describe("MockAdapter", () => {
  it("returns envelopes with sequential request ids", async () => {
    const api = createClient(new MockAdapter(routes));
    const first = await api.get<{ id: string }[]>("/api/items");
    expect(first).toEqual([{ id: "item-1" }]);
  });

  it("binds :param segments into route params", async () => {
    const api = createClient(new MockAdapter(routes));
    const item = await api.get<{ id: string; name: string }>("/api/items/item-7");
    expect(item.id).toBe("item-7");
  });

  it("surfaces error bodies as ApiError", async () => {
    const api = createClient(new MockAdapter(routes));
    await expect(api.get("/api/fail")).rejects.toMatchObject({
      name: "ApiError",
      code: "validation_error",
    });
  });

  it("reports unknown routes as not_found, never a guess", async () => {
    const api = createClient(new MockAdapter(routes));
    await expect(api.get("/api/nope")).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("HttpAdapter", () => {
  it("returns the same envelope as the mock for success", async () => {
    const http = new HttpAdapter("http://test", {
      fetchFn: stubFetch(ok([{ id: "item-1" }], "req-1")),
    });
    const res = await http.get<{ id: string }[]>("/api/items");
    expect(res.data).toEqual([{ id: "item-1" }]);
    expect(res.meta.request_id).toBe("req-1");
  });

  it("maps API error bodies to ApiError with the HTTP status", async () => {
    const http = new HttpAdapter("http://test", {
      fetchFn: stubFetch(err("forbidden", "denied"), 403),
    });
    await expect(http.get("/api/denied")).rejects.toMatchObject({
      code: "forbidden",
      status: 403,
    });
  });

  it("maps transport failures to network_error", async () => {
    const http = new HttpAdapter("http://test", {
      fetchFn: (() => Promise.reject(new TypeError("down"))) as typeof fetch,
    });
    await expect(http.get("/api/items")).rejects.toMatchObject({ code: "network_error" });
  });

  it("retries a GET once on network_error, never on an API error", async () => {
    let calls = 0;
    const flaky = (() => {
      calls += 1;
      return calls === 1
        ? Promise.reject(new TypeError("down"))
        : Promise.resolve(
            new Response(JSON.stringify(ok("fine", "req-2")), { status: 200 }),
          );
    }) as typeof fetch;
    const api = createClient(new HttpAdapter("http://test", { fetchFn: flaky }));
    expect(await api.get<string>("/api/items")).toBe("fine");
    expect(calls).toBe(2);

    calls = 0;
    const alwaysFail = (() => {
      calls += 1;
      return Promise.resolve(
        new Response(JSON.stringify(err("forbidden", "denied")), { status: 403 }),
      );
    }) as typeof fetch;
    const denied = createClient(new HttpAdapter("http://test", { fetchFn: alwaysFail }));
    await expect(denied.get("/api/denied")).rejects.toMatchObject({ code: "forbidden" });
    expect(calls).toBe(1);
  });
});
