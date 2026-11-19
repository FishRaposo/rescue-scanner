import type { ApiEnvelope } from "./envelope";

/**
 * Adapters surface a transport/protocol failure as this single error type.
 * `code` mirrors the API error body's code; `status` is the HTTP status when
 * one exists (0 for client-side/network failures).
 */
export class ApiError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly status: number;

  constructor(code: string, message: string, details?: unknown, status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

/** The single seam the UI talks to. The UI never branches on which adapter. */
export interface ApiAdapter {
  get<T>(path: string, params?: Record<string, string>): Promise<ApiEnvelope<T>>;
  post<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>>;
  put<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>>;
  delete<T>(path: string): Promise<ApiEnvelope<T>>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
