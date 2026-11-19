# Architecture — Rescue Scanner

## What it is

A Node/TypeScript static analyzer plus a static Next.js report. There is **no
backend**: the scanner is a CLI and the report renders a committed fixture
scan. Python appears only in the shared tooling scripts (build/serve/cards),
as in every piece.

```
rescue-scanner/
├── scanner/                  # the tool — TypeScript, runs without a build step
│   ├── bin.mjs               #   `rescue-scanner` bin: imports src/cli.ts
│   └── src/
│       ├── types.ts          #   Finding/Rule/ScanReport model + line helpers
│       ├── walk.ts           #   repo walker + file-kind classification
│       ├── rules.ts          #   the 8 rules (checkFile/checkRepo)
│       ├── scan.ts           #   walk → run rules → ranked ScanReport
│       ├── report.ts         #   self-contained HTML report renderer
│       ├── cli.ts            #   arg parsing, text/json/html, exit codes
│       ├── rules.test.ts     #   fixture expectations (bad fires, clean doesn't)
│       └── cli.test.ts       #   CLI contract: formats, --out, --fail-on codes
├── fixtures/
│   ├── bad-app/              #   mini Next/Supabase repo, one defect per rule
│   ├── clean-app/            #   same layout remediated + FP-shape coverage
│   └── scans/                #   committed scan output (report data source)
├── frontend/                 #   Next.js static report (report.tsx data lib,
│   └── app/                  #   findings table, /findings/[slug], /rules)
├── scripts/                  #   vendored tooling: verify, build_demo, cards…
└── shared/                   #   vendored scaffold modules (api mock, ui…)
```

## Data flow

```
repo path ──walk──► SourceFile[] (kind: client/server/route/sql/env/test)
                    │
                    ▼ per-file + per-repo rules
              Finding[] (ruleId, severity, confidence, path:line, evidence, remediation)
                    │
                    ▼ sorted: severity → ruleId → path → line
              ScanReport ──► text / json / html (CLI)   exit 0/1/2
                    │
                    └─ committed copy ─► fixtures/scans/bad-app.scan.json
                                          └──► frontend mock adapter ─► report pages
```

## Decision boundary

- **Deterministic only.** Every finding is produced by a typed rule over file
  text. No model call, no network read, no heuristics that can't show their
  evidence line.
- **Rules are the unit of truth.** A rule may emit zero or more findings per
  file (`checkFile`) or once per repo (`checkRepo`). Confidence and severity
  live on the rule; a finding may downgrade severity (e.g. a weaker signal).
- **`unknown` has no place here** — unlike Deploy Doctor, silence is not a
  diagnosis. A clean scan means "no findings within the documented limits",
  which the report states explicitly.

## Exit codes (CLI)

`0` clean or below `--fail-on` · `2` findings at/above threshold (default
`high`) — the CI gate · `1` usage/error.

## Demo mode

`frontend/` statically exports. `NEXT_PUBLIC_DEMO_MODE` only controls the
sample-data badge — the data is always the committed fixture scan, served
through the shared mock adapter (`/api/scan`, `/api/scan/findings/:slug`) so
the envelope contract is exercised the same way locally and on Pages.
