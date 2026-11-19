/**
 * The one response shape every endpoint and every adapter uses.
 *
 * Success: { data: T, meta: { request_id } }
 * Error:   { error: { code, message, details? } }
 *
 * Both adapters return or throw on this same shape; the mock never invents a
 * different error path.
 */

export type ApiMeta = { request_id: string };

export type ApiEnvelope<T> = { data: T; meta: ApiMeta };

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

export type ApiResult<T> = ApiEnvelope<T> | ApiErrorBody;

export function ok<T>(data: T, requestId: string): ApiEnvelope<T> {
  return { data, meta: { request_id: requestId } };
}

export function err(code: string, message: string, details?: unknown): ApiErrorBody {
  if (details === undefined) {
    return { error: { code, message } };
  }
  return { error: { code, message, details } };
}

export function isErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiErrorBody).error === "object" &&
    typeof (body as ApiErrorBody).error.code === "string"
  );
}

export function isEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
  return (
    typeof body === "object" &&
    body !== null &&
    "data" in body &&
    "meta" in body &&
    typeof (body as ApiEnvelope<T>).meta === "object" &&
    typeof (body as ApiEnvelope<T>).meta.request_id === "string"
  );
}
