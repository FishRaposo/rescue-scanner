# Issue register — data for Fix Bench

Every portfolio repo, and the hub, records every real issue it finds. The records are the raw material for [Fix Bench](../../plans/fix-bench.md) tasks and for each repo's case study. Copy this file into each repo as `docs/ISSUE_REGISTER.md`.

## The rule

**Register every issue you find, when you find it, before you fix it.** This applies to people and agents alike, and to issues you caused yourself.

Register:

- a bug in the code, a wrong result, a crash;
- a failed build, deploy or CI run;
- a failing or flaky test;
- a finding from Rescue Scanner, Deploy Doctor, a linter, a type-checker or a review;
- a security or data-isolation gap;
- a wrong or misleading doc or claim that caused a wrong action.

Do not register: feature ideas, style preferences, planned work that is simply not done yet.

Never stage an issue to have something to register (`D-069`). A record with no real failing state is deleted from the plan, not from the register: mark it `not-a-bug` and say why.

## Where a record goes

- **In a portfolio repo:** `docs/issues/<id>.json`, committed in that repo.
- **In the hub:** `portfolio/issue-register/issues/hub/<id>.json`.
- **Central copy:** the hub's `portfolio/issue-register/issues/<repo>/`. From the hub root, `python scripts/collect_issues.py` copies every repo's records there and validates them. The repo's own file stays the source; edit it there and collect again.

`<id>` is `YYYY-MM-DD-short-slug`, using the date the issue was found. It never changes.

## Order of work

1. Reproduce the issue and note the exact commands.
2. Write the record with `status: "open"` and the failing revision (the commit that shows the failure; commit the failing state first if it is not committed).
3. Fix it, with a regression test that fails before the fix and passes after.
4. Update the same record: `fix_commit`, `regression_test`, `root_cause`, `status: "fixed"`.
5. Never delete a record. A wrong record is corrected or marked `not-a-bug`.

## Record format

One JSON object per file, UTF-8.

```json
{
  "id": "2026-11-17-webhook-replay-double-paid",
  "repo": "client-portal",
  "title": "Replayed Stripe webhook marks the invoice paid twice",
  "kind": "bug",
  "found_date": "2026-11-17",
  "found_by": "test",
  "symptom": "What was observed, in one or two sentences.",
  "reproduce": ["exact command 1", "exact command 2"],
  "expected": "What should have happened.",
  "failing_revision": "full commit sha, or null if the failing state was never committed",
  "fix_commit": "full commit sha, or null while open",
  "regression_test": "path::test_name, or null while open",
  "root_cause": "One or two sentences, or null while unknown.",
  "status": "open",
  "bench_candidate": "unknown",
  "bench_note": "Why it would or would not make a benchmark task.",
  "publishable": true,
  "notes": ""
}
```

| Field | Allowed values |
|---|---|
| `repo` | `client-portal`, `docs-answer`, `deploy-doctor`, `rescue-scanner`, `triage-agent`, `fix-bench`, `hub` |
| `kind` | `bug`, `build-failure`, `test-failure`, `security`, `data`, `docs`, `process` |
| `found_by` | `human`, `agent`, `test`, `ci`, `review`, `deploy-doctor`, `rescue-scanner` |
| `status` | `open`, `fixed`, `wontfix`, `not-a-bug` |
| `bench_candidate` | `yes`, `no`, `unknown` |
| `publishable` | `true` or `false` |

All fields are required; use `null` or `""` where nothing is known yet. `status: "fixed"` requires `fix_commit`.

## What makes a good benchmark candidate

Mark `bench_candidate: "yes"` when all of these hold:

- the failing state is a committed revision someone else can check out;
- a test decides pass or fail without a human;
- the fix is one bounded change, not a redesign;
- the task can be stated without giving away the fix.

Otherwise mark `no` and say why in `bench_note`. A `no` is still worth recording: the register is also the source for case studies.

## Limits

- No secrets, keys, tokens, personal data, client names or client code in a record.
- Hub records default to `publishable: false`: the hub is private. A hub issue becomes publishable only if it can be reproduced from files that are safe to publish on their own.
- A record states what was observed. It makes no claim about users, clients or production.
- Fix Bench publishes a task only from a record with `publishable: true`, a committed failing revision and a fix commit.
