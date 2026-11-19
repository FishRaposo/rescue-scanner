# AGENTS.md — Rescue Scanner

## What this repo is

A static audit tool for AI-generated Next.js/Supabase repos: it finds the failure classes that stall generated apps, ranks them and suggests safe patches.

Type: CLI (supporting). Portfolio piece of Fish (Vinícius Raposo), Full-Stack & AI Engineer. Planned 2026-11-17; update this line when the first version exists.

## Read first

- `README.md` — what the piece does and the 30-second / 2-minute / 30-minute path.
- `docs/ARCHITECTURE.md` — runtime modes, data flow, the decision boundary.
- `docs/ISSUE_REGISTER.md` — the issue-register rule and record format (summarised below).
- `docs/NO_INFRA.md`, `docs/DEMO_CONTRACT.md`, `docs/CASE_STUDY.md`, `docs/verification.md`.
- `docs/RULES.md` (each rule, its severity, its false-positive fixture).

## Register every issue you find

This is a standing instruction for every agent and person working in this repo. The records are the data for Fix Bench and for this repo's case study.

1. **When you find an issue, register it before you fix it.** An issue is any real defect: a false positive, a missed finding, an unsafe suggested patch, a rule that crashes on real code; also any failed build or CI run, failing or flaky test, tool or review finding, security gap, or doc that caused a wrong action. Issues you caused yourself count.
2. **Write one file:** `docs/issues/<YYYY-MM-DD>-<short-slug>.json`, in the format in `docs/ISSUE_REGISTER.md`. Start with `"repo": "rescue-scanner"`, `"status": "open"`, the symptom, the exact commands that reproduce it, and `failing_revision` (commit the failing state first if it is not committed).
3. **Fix it with a regression test** that fails before the fix and passes after.
4. **Update the same file:** `fix_commit`, `regression_test`, `root_cause`, `"status": "fixed"`, and `bench_candidate` (`yes` only if a test decides pass or fail, the failing revision is committed, and the fix is one bounded change).
5. **Never delete a record** and never stage an issue to have one. A mistaken record is marked `not-a-bug` with the reason.
6. **No secrets, keys, personal data, client names or client code** in a record.
7. **Say it in your report:** every hand-back lists the issue ids you registered or updated, or says "no issues found".

The hub collects these files into its central register with `python scripts/collect_issues.py` (run from the hub root). This repo's file is the source; correct it here.

## Rules for this piece

- It reads repository source only. It never probes, scans or sends a request to a live deployed app.
- A finding in someone else's public repository goes to the maintainer privately first. Nothing is published naming a project without that; contacting a maintainer is Fish's action.
- Every rule has a true-positive and a false-positive fixture.
- A finding in one of our own repos (client-portal, docs-answer, triage-agent) is an issue: register it in the repo where it was found.

## Rules for every piece

- **Real, not staged.** No fake broken state, no synthetic rescue, no invented result. The case study names a real issue from `docs/issues/`.
- **No-infra local run.** Python 3.11+ and Node 24+ only: no Docker, WSL, database server, cloud account or key on the default path. Real adapters are optional and behind an explicit flag.
- **No claims.** Nothing in the repo says it has users, clients, payments or production use, and no metric appears without the dated run that produced it.
- **Run a real check before reporting done:** the repo's verification command, or the tests that exercise the change. A syntax check does not count. If a check could not run, say which and why.
- **Keep the docs current:** a change to behaviour updates the README, the affected `docs/` file and this file in the same change.
- **Owner-only actions:** pushing, opening the repo to the public, releases, Pages deploys, pins, spending money on a model or service, and any message or pull request outside this repo are Fish's. Commit locally; prepare the rest and name what is left for him.
- **English**, plain and factual.

## Commands

Nothing is built yet. When the launcher and the verification command exist, list them here exactly as the README gives them: install, run, verify.
