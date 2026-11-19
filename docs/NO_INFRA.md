# No-infrastructure contract

**Web apps only.** The three CLI pieces (Deploy Doctor, Rescue Scanner, Fix Bench) use [CLI_CONTRACT](CLI_CONTRACT.md). Deploy Doctor needs Python 3.11+ and the standard library only; it does not need Node/npm, a frontend or a backend service.

Every D-068 web app must run locally with the following only:

- Node 24+ and npm for the frontend.
- Python 3.11+ and pip for the backend.
- SQLite (file or in-memory) for storage. Exception (D-076): Client Portal uses an embedded, in-process Postgres so its row-level policies are real; it is a library, not a database server, and is unverified until that piece's first-day spike.
- Deterministic mock adapters for external services.

## Not required on the default path

- Docker, Docker Compose, WSL or a Linux VM.
- PostgreSQL, Redis, Celery or any database/cache server.
- Supabase cloud, Stripe account, model provider key or any external API.
- Cloud hosting, tunnels or background services.

## Allowed

- Frameworks and libraries: Next.js, React, TypeScript, Tailwind, FastAPI, Pydantic, SQLAlchemy/SQLModel, pytest, Vitest, Playwright, axe.
- SQLite file creation in a local data folder.
- Committed deterministic fixtures and precomputed outputs.
- Optional real adapters behind an explicit flag, documented and never required.

## One-command run

The repo must provide a cross-platform launcher (Node or Python, no bash-only scripts) that installs nothing unexpected, seeds the local data and starts the app. A second command runs the full verification suite.

## Clean-machine audit

Acceptance requires a fresh clone on a machine without Docker/WSL and without keys:

1. `git clone` the repo.
2. Run the documented install command.
3. Run the one-command launcher.
4. Open the app, follow the recruiter path, stop it.
5. Run the verification command.

Record the exact commands, output and date in `docs/verification.md`.
