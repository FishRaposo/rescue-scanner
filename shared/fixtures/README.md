# shared/fixtures

Deterministic sample data for demo mode and tests.

## Rules

- Stable ids, seeds and timestamps; the same input produces the same output.
- No real PII, credentials, client data or private documents.
- Public corpora record source, licence and snapshot date.
- Scenario files are explicit: traces, documents, tenants, projects, inbox items.
- Every demo screen shows a **Sample data** label.
- Fixtures live in the repo and may be extended there; the scaffold provides the format only.

## Acceptance

- The demo boots from fixtures with no backend.
- The local run seeds the same scenarios.
- Tests can reset to a known state.
- A fixture never implies a client, a production user or a real result.
