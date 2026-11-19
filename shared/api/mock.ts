import { ApiError, type ApiAdapter, type HttpMethod } from "./adapter";
import { isErrorBody, ok, type ApiEnvelope } from "./envelope";

/** What a mock route returns: an envelope (success) or error body (failure). */
export type MockResponder = (req: {
  path: string;
  params: Record<string, string>;
  body?: unknown;
}) => unknown;

export interface MockRoute {
  method: HttpMethod;
  /** Exact path (`/api/items`) or `:param` segments (`/api/items/:id`). */
  path: string;
  respond: MockResponder;
}

export interface MockAdapterOptions {
  /** Fixed latency in ms — deterministic, defaults to 0 for tests. */
  latencyMs?: number;
}

function matchPath(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const pp = pattern.split("/").filter(Boolean);
  const ap = path.split("/").filter(Boolean);
  if (pp.length !== ap.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i += 1) {
    const p = pp[i]!;
    const a = ap[i]!;
    if (p.startsWith(":")) {
      params[p.slice(1)] = a;
    } else if (p !== a) {
      return null;
    }
  }
  return params;
}

/**
 * Deterministic adapter for the static demo and component tests. It never
 * touches the network. request_ids are sequential (`req-1`, `req-2`, …) so
 * snapshots stay stable.
 */
export class MockAdapter implements ApiAdapter {
  private counter = 0;
  private readonly routes: MockRoute[];
  private readonly latencyMs: number;

  constructor(routes: MockRoute[], options: MockAdapterOptions = {}) {
    this.routes = routes;
    this.latencyMs = options.latencyMs ?? 0;
  }

  private async call<T>(
    method: HttpMethod,
    path: string,
    params: Record<string, string>,
    body?: unknown,
  ): Promise<ApiEnvelope<T>> {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
    this.counter += 1;
    const requestId = `req-${this.counter}`;

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const routeParams = matchPath(route.path, path);
      if (routeParams === null) continue;
      const out = route.respond({ path, params: { ...params, ...routeParams }, body });
      if (isErrorBody(out)) {
        throw new ApiError(out.error.code, out.error.message, out.error.details, 400);
      }
      return ok(out as T, requestId);
    }

    throw new ApiError("not_found", `No mock route for ${method} ${path}`, undefined, 404);
  }

  get<T>(path: string, params?: Record<string, string>): Promise<ApiEnvelope<T>> {
    return this.call<T>("GET", path, params ?? {});
  }
  post<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
    return this.call<T>("POST", path, {}, body);
  }
  put<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
    return this.call<T>("PUT", path, {}, body);
  }
  delete<T>(path: string): Promise<ApiEnvelope<T>> {
    return this.call<T>("DELETE", path, {});
  }
}
