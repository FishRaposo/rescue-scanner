# Verification record — rescue-scanner

**CLIs:** the scanner's contract table; the second table is the static report demo.

## Local, no infrastructure

| Check | Command | Expected | Date | Result |
|---|---|---|---|---|
| Install | `npm ci` | deps installed at repo root | 2026-11-19 | PASS (440 pkgs) |
| Scanner | `node scanner/bin.mjs scan fixtures/bad-app` | 14 findings (5 high), exit 2 | 2026-11-19 | PASS |
| Scanner clean | `node scanner/bin.mjs scan fixtures/clean-app` | 0 findings, exit 0 | 2026-11-19 | PASS |
| Typecheck | `npm run typecheck` | clean | 2026-11-19 | PASS |
| Lint | `npm run lint` | 0 errors | 2026-11-19 | PASS (2 vendored warnings) |
| Unit | `npm run unit` | vitest suites green | 2026-11-19 | PASS (14 tests) |
| Report build | `python scripts/build_demo.py` | static export to `site/` | 2026-11-19 | PASS (18 pages) |
| Cards | `python scripts/cards.py` | 3× 1000×750 PNG | 2026-11-19 | PASS |
| Verify | `python scripts/verify.py --e2e` | typecheck+lint+unit+build+demo+e2e | 2026-11-19 | PASS |

Environment: Windows 11, Node 26.13.1, npm 11.20.0, Python 3.15.2, Playwright Chromium — no Docker/WSL, no keys, no network.

## Live demo

| Check | URL | Expected | Date | Result |
|---|---|---|---|---|
| Sample data label | `/rescue-scanner/` | "scan of the bundled bad-app fixture" badge | 2026-11-19 | PASS (check_live) |
| Deep link | `/rescue-scanner/findings/f-03/` | boots | 2026-11-19 | PASS |
| Off-origin requests | all pages | zero | 2026-11-19 | PASS (check_live) |
| Console | all pages | clean | 2026-11-19 | PASS (check_live + e2e) |
| Accessibility | `/`, `/findings/f-01/`, `/rules/` | zero axe violations | 2026-11-19 | PASS (e2e) |

## Real-repo scans (2026-11-19, local clones)

| Repo | Before FP fixes | After |
|---|---|---|
| entrega-clara | 5 medium | 1 medium (missing-auth-check — inside the rule's documented blind spot) |
| evalforge | 9 medium / 9 low | 0 / 4 low |
| aria-agent | 9 medium / 14 low | 0 / 5 low |
| agenttrace | 5 medium / 7 low | 0 (after fix commit `be04ffe` in that repo) |
| policydesk | 5 medium / 2 low | 0 |
| WCP-Compliance-Agent-V5 | 16 medium / 8 low | 0 / 3 low |

## Notes

- The published Pages deployment is an owner action — the live URL line in
  docs/CASE_STUDY.md is unverified until Fish deploys.
- e2e runs against the built static export, not a dev server.
- `fixtures/scans/bad-app.scan.json` is committed report data; CI regenerates
  it via `npm run scan:fixtures` before the export so the demo always matches
  current rules.
