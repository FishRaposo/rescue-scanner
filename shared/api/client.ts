import { ApiError, type ApiAdapter } from "./adapter";
import type { ApiEnvelope } from "./envelope";

/**
 * The typed client the UI uses. It unwraps `envelope.data` and owns the two
 * cross-cutting policies: retry (one retry on a GET network error) and request
 * timeout propagation. Display of errors is the `ErrorState` component's job.
 */
export interface ApiClient {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export function createClient(adapter: ApiAdapter): ApiClient {
  async function unwrap<T>(call: () => Promise<ApiEnvelope<T>>): Promise<T> {
    const res = await call();
    return res.data;
  }

  return {
    get<T>(path: string, params?: Record<string, string>): Promise<T> {
      // One retry on a network error only; never retry an API error body.
      return unwrap(() => adapter.get<T>(path, params)).catch((e: unknown) => {
        if (e instanceof ApiError && e.code === "network_error") {
          return unwrap(() => adapter.get<T>(path, params));
        }
        throw e;
      });
    },
    post<T>(path: string, body?: unknown): Promise<T> {
      return unwrap(() => adapter.post<T>(path, body));
    },
    put<T>(path: string, body?: unknown): Promise<T> {
      return unwrap(() => adapter.put<T>(path, body));
    },
    delete<T>(path: string): Promise<T> {
      return unwrap(() => adapter.delete<T>(path));
    },
  };
}
