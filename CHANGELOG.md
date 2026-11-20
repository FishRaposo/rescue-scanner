# Changelog

## [0.1.0] — 2026-11-19

First working version: an eight-rule static audit for AI-generated
Next.js/Supabase repositories, with ranked findings, evidence and a static report.

### Added

- Eight evidence-backed rules covering secrets in client code, missing RLS,
  boundary leaks, unsafe routes, missing auth checks, deploy and env
  misconfiguration, and missing tests.
- A fixture pair (`bad-app` / `clean-app`) proving each rule fires on a planted
  defect and stays silent on the remediated layout.
- A CLI with JSON and HTML output and a `--fail-on` threshold for CI.
- A static report with deep links, and Playwright + axe coverage.
- `docs/RULES.md` (every rule and its blind spot) and `docs/CASE_STUDY.md` (a real
  defect found in the owner's `agenttrace` repo).

### Fixed

- Three false-positive classes found by scanning six real repositories
  ([`docs/issues/2026-11-19-deploy-misconfig-env-backed-fp`](docs/issues/2026-11-19-deploy-misconfig-env-backed-fp.json),
  [`docs/issues/2026-11-19-env-misconfig-test-infra-fp`](docs/issues/2026-11-19-env-misconfig-test-infra-fp.json),
  [`docs/issues/2026-11-19-env-misconfig-commented-decls`](docs/issues/2026-11-19-env-misconfig-commented-decls.json)).
- Accessibility violations in the report pages
  ([`docs/issues/2026-11-19-report-a11y-violations`](docs/issues/2026-11-19-report-a11y-violations.json)).
- The README carried no proof image, and it carried a hard-coded test count that
  drifted ([`docs/issues/2026-11-19-readme-no-proof-image`](docs/issues/2026-11-19-readme-no-proof-image.json),
  [`docs/issues/2026-11-19-readme-stale-test-count`](docs/issues/2026-11-19-readme-stale-test-count.json)).
- The verification record's unit count was stale
  ([`docs/issues/2026-11-19-verification-unit-count-stale`](docs/issues/2026-11-19-verification-unit-count-stale.json)).
