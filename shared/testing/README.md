# shared/testing

Test and accessibility harness.

## Frontend

- Vitest for components and state.
- Playwright for the core journey, the deep link and the demo build.
- axe on the core journey and key detail screens.
- No network calls in the default suite.

## Backend

- pytest for the domain, API contract and rules.
- Temporary SQLite file or memory per test.
- Mock providers; no external calls.
- A failing-before/passing-after test where the piece records a real bug.

## CI

- No services, no keys.
- Typecheck, lint, unit, build, e2e/a11y.
- The demo build is checked in CI.
- A skip is not a pass.

## Acceptance

- The core journey has one end-to-end test.
- The real-bug regression test is committed.
- The demo deep link is tested.
- axe is clean on the key screens.
