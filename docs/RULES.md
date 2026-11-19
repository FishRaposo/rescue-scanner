# Rules — Rescue Scanner

Eight rules, each with severity, confidence, a bad/clean fixture pair and a
documented blind spot. Signals are regex/heuristic over source text — the
report always shows the matched line as evidence.

| id | severity | confidence | detects |
|---|---|---|---|
| `server-secret-in-client` | high | high | `NEXT_PUBLIC_*` prefix on a secret-shaped env name; a `process.env.*SECRET/SERVICE_ROLE/PRIVATE/TOKEN*` read inside a `"use client"` file |
| `missing-rls` | high | medium | `CREATE TABLE` in a Supabase migration with no `ENABLE ROW LEVEL SECURITY`; any `USING (true)` policy (high confidence) |
| `boundary-leak` | high | high | a client component importing `fs`, `next/headers`, `supabase/server`, a db client or `server-only` |
| `unsafe-api-route` | medium | medium | POST/PUT/PATCH/DELETE handler reading `request.json()/formData()` with no recognizable validator (zod/safeParse/ajv/…) |
| `missing-auth-check` | medium | medium | a page/route under a protected prefix (`app/dashboard|admin|account|settings|profile|(protected)`) with no auth call in file or ancestor layout |
| `deploy-misconfig` | medium | high | a bare `http://localhost`/`127.0.0.1` or plain `http://` URL literal in product code |
| `env-misconfig` | low | medium | `process.env.KEY` used in product code but absent from `.env.example` (uncommented or `# KEY=` commented declarations both count) |
| `missing-test` | low | medium | a route handler with no same-named `.test.`/`.spec.` file anywhere in the repo |

## What the rules deliberately skip

Files classified `test` (e2e dirs, `__tests__`, `*.test.*`, `*.spec.*`,
playwright/vite/vitest/jest configs) and `env-example` are excluded from
file-level rules; `env-misconfig` also skips `scripts/`, `tools/` and `bin/`
directories. `deploy-misconfig` skips URL literals that are env-backed on the
same line (`process.env.X ?? "…"`, `environment.X ?? "…"`, zod `.default("…")`),
`new URL(path, "…")` parse bases, `http://${…}` template builders, and
literals inside `\n`-escaped docs/snippet strings.

## Blind spots (the same list the report shows)

- **server-secret-in-client** — cannot see secrets reached through indirection (a server file re-exporting to a client file, or a secret passed via prop).
- **missing-rls** — cannot see RLS managed outside migrations (dashboard changes, seed scripts), nor judge whether a policy predicate is *correct*.
- **boundary-leak** — only direct imports; a server helper re-imported through a server file chain is not followed.
- **unsafe-api-route** — flags the absence of a recognizable validator, not a wrong schema; a schema validating nothing still passes.
- **missing-auth-check** — fixed protected prefixes and auth-call shapes only; middleware-level auth is credited only when the file or layout mentions it (e.g. entrega-clara's header-based demo identity is invisible to it — its finding there is inside this limit).
- **deploy-misconfig** — matches URL-shaped strings; hosts assembled from variables and local URLs in comments are not seen.
- **env-misconfig** — `process.env.NAME` references only; destructured env objects and keys in config files outside scanned roots are missed.
- **missing-test** — a same-named test file anywhere satisfies it; it cannot judge whether the test exercises the route.

## Fixtures

`fixtures/bad-app` carries one real defect per rule (14 findings: 5 high,
5 medium, 4 low). `fixtures/clean-app` is the same layout remediated **plus**
one file per known false-positive shape (env-backed defaults, test tooling,
docs strings, URL bases, commented env declarations) — its zero-findings scan
is the FP gate.
