# Contributing

This is a personal portfolio piece. The most useful contribution is a
false positive or a false negative from a real repository — that is how every
rule in here was corrected.

## Run it

```sh
npm ci
npm run scan -- fixtures/bad-app      # 14 findings, exit 2
npm run scan -- fixtures/clean-app    # 0 findings, exit 0
```

Node 24+ and npm only. No build step, no keys, no network.

## Before opening a pull request

```sh
python scripts/verify.py --e2e
```

That runs typecheck, lint, the vitest suites, the demo export and Playwright with
axe.

## A new or changed rule needs

1. A planted defect in `fixtures/bad-app` that the rule must catch.
2. The same layout remediated in `fixtures/clean-app` that it must not flag —
   including any known false-positive shape.
3. The rule's blind spot written into `docs/RULES.md` and on the report's rules
   page.
4. The finding-write behavior unchanged by default: it reports, it does not patch.

## Conventions

- Conventional commit subjects (`fix:`, `feat:`, `docs:`, `test:`, `chore:`).
- Heuristics over source text will always have blind spots; document them rather
  than hiding them.

## Reporting a security issue

Use [SECURITY.md](SECURITY.md), not a public issue.
