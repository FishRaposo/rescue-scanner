# shared/api

Typed API client with two adapters.

## Interface

```ts
interface ApiAdapter {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}
```

- `MockAdapter` — deterministic fixtures, simulated latency, no network.
- `HttpAdapter` — local FastAPI base URL in local mode.
- The client selects the adapter from `NEXT_PUBLIC_DEMO_MODE`; the UI never branches.

## Response envelope

```ts
type ApiError = { code: string; message: string; details?: unknown };
```

- Errors are typed and rendered by `ErrorState`.
- No raw stack traces or secrets in the UI.
- Unknown fields are ignored; missing required fields fail loudly.

## Rules

- One error shape across the six.
- No `fetch` calls outside the client.
- No external URLs in demo mode.
- Tests cover success, validation error, not-found and server error.
