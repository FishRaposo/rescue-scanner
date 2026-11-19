# shared/db

SQLite helpers, migrations, seed and search.

## Pieces

- Connection helper: file or in-memory; one connection per request/test.
- Migration runner: ordered SQL files; idempotent on startup.
- Seed runner: deterministic fixtures; safe to re-run in tests.
- Transaction helper: commit/rollback with a clear boundary.
- FTS5 helper: create, index and query for document retrieval.
- Repository helpers: tenant/workspace scoping where relevant.

## Rules

- No database server; SQLite only on the default path.
- No ORM required; SQLModel/SQLAlchemy optional and documented.
- Every table has a primary key; timestamps are UTC.
- No secrets or real PII in seed data.
- Migrations are committed; a fresh clone creates the database automatically.
- Tests use a temporary SQLite file or memory; no network.
