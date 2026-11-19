import { ApiError, type ApiAdapter } from "./adapter";
import { isEnvelope, isErrorBody, type ApiEnvelope } from "./envelope";

export interface HttpAdapterOptions {
  /** Milliseconds before a request aborts. Default 10s. */
  timeoutMs?: number;
  /** Injectable for tests; defaults to global fetch. */
  fetchFn?: typeof fetch;
  headers?: Record<string, string>;
}

function buildQuery(params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return "";
  const q = new URLSearchParams(params);
  return `?${q.toString()}`;
}

/** The local-mode adapter: real HTTP against the repo's FastAPI backend. */
export class HttpAdapter implements ApiAdapter {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;
  private readonly headers: Record<string, string>;

  constructor(baseUrl: string, options: HttpAdapterOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.fetchFn = options.fetchFn ?? fetch.bind(globalThis);
    this.headers = options.headers ?? {};
  }

  private async call<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: unknown,
  ): Promise<ApiEnvelope<T>> {
    const url = `${this.baseUrl}${path}${buildQuery(params)}`;
    let res: Response;
    try {
      res = await this.fetchFn(url, {
        method,
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...this.headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        credentials: "include",
      });
    } catch {
      throw new ApiError("network_error", `Could not reach ${this.baseUrl}`, undefined, 0);
    }

    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new ApiError("bad_response", `Non-JSON response from ${url}`, undefined, res.status);
    }

    if (isErrorBody(payload)) {
      throw new ApiError(
        payload.error.code,
        payload.error.message,
        payload.error.details,
        res.status,
      );
    }
    if (!res.ok) {
      throw new ApiError("http_error", `HTTP ${res.status} from ${url}`, payload, res.status);
    }
    if (!isEnvelope<T>(payload)) {
      throw new ApiError("bad_response", `Malformed envelope from ${url}`, payload, res.status);
    }
    return payload;
  }

  get<T>(path: string, params?: Record<string, string>): Promise<ApiEnvelope<T>> {
    return this.call<T>("GET", path, params);
  }
  post<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
    return this.call<T>("POST", path, undefined, body);
  }
  put<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
    return this.call<T>("PUT", path, undefined, body);
  }
  delete<T>(path: string): Promise<ApiEnvelope<T>> {
    return this.call<T>("DELETE", path);
  }
}
