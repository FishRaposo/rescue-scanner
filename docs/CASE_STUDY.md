# Case study — Rescue Scanner

**Offer:** `L1`/`G1`
**Live demo:** <https://fishraposo.github.io/rescue-scanner/> (owner deploys)
**Source:** <https://github.com/FishRaposo/rescue-scanner>

## The problem

AI-generated Next.js/Supabase apps stall on the same handful of defect
classes — a secret shipped client-side, a table without RLS, a route handler
trusting its input — and a reviewer has to re-derive them every time.

## What was built

An eight-rule static analyzer (`scanner/`, ~600 lines of TypeScript run
directly by Node 24+) plus a static report (`frontend/`). Every finding names
file, line, evidence and a concrete patch; every rule documents its blind
spot. The fixture pair proves each rule fires on a planted defect and stays
silent on the remediated layout.

## What it proves

The full loop ran on **six real earlier public repos** on 2026-11-19, not on
fixtures alone:

- **A real defect found and fixed:** `env-misconfig` flagged the `agenttrace`
  dashboard reading `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEMO_MODE`,
  `NEXT_STATIC_EXPORT`, `NEXT_BASE_PATH` and `NEXT_DIST_DIR` — none documented
  in `.env.example`. Fixed in that repository at commit `be04ffe` (commented
  optional declarations added); the re-scan is clean.
- **Three real defects in the scanner itself**, registered before fixing per
  the issue-register rule (`docs/issues/`):
  - `2026-11-19-deploy-misconfig-env-backed-fp` — env-backed localhost
    defaults, URL parse bases, `http://${…}` builders, docs strings and
    test-tooling files were all flagged (~50 findings across the six repos).
    Fixed at `eb91285`; those repos now scan at 1 medium + 17 low.
  - `2026-11-19-env-misconfig-test-infra-fp` — test-harness env keys flagged
    as deploy requirements.
  - `2026-11-19-env-misconfig-commented-decls` — discovered *while applying
    the agenttrace fix*: commented `# KEY=` declarations weren't parsed, so
    the documented keys still flagged. Same fix commit.
- One finding verified as **inside a documented limit** rather than a defect:
  `missing-auth-check` on entrega-clara's `app/web/src/app/admin/page.tsx` —
  that repo's header-based demo identity is invisible to the rule by design,
  and the rule's stated blind spot covers it.

## What it does not prove

The report data is the bundled fixture scan (labelled sample data). Scanning
more repos would surface more blind spots — that is expected and the issue
register is where they go. No claim of client work, production usage or
security coverage.

## What went wrong

The false-positive harvest above was the main implementation problem: the
first version treated every URL literal and every env reference as evidence,
which real repos disproved immediately. The fix taught the rules the
difference between a defect and its own remediation pattern.

## What I would change

The next rules to add are cross-file ones (a secret defined server-side that
reaches a client file through imports) — today's file-local rules can't see
them, and the limits say so.
