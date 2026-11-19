# shared/ci

GitHub Actions workflows for every piece.

**CLIs** (Deploy Doctor, Rescue Scanner, Fix Bench): `ci.yml` runs the CLI tests and fixture assertions; `pages.yml` publishes the static recorded-run page. No Playwright, axe or Next.js export. See [CLI_CONTRACT](../../docs/CLI_CONTRACT.md).

## `ci.yml`

- Web apps: Node 24 + Python 3.11.
- CLIs: the piece's runtime only (Deploy Doctor: Python 3.11; Rescue Scanner and Fix Bench per their plans).
- No services, no keys, no network-dependent tests.
- Steps: install, typecheck/lint where applicable, unit and fixture tests, build, e2e/a11y for web apps.
- The demo build is verified for web apps; the CLI fixture run is verified for CLIs.
- Pinned action versions.

## `pages.yml`

- Runs on `main` only.
- Builds the static demo with the repo base path.
- Copies `index.html` to `404.html`; ensures `.nojekyll`.
- Deploys to GitHub Pages.
- No deploy on pull requests.

## Acceptance

- CI is green on a clean clone.
- The Pages deploy is reproducible.
- A deep link boots on the live URL.
- Zero off-origin requests and a clean console.
