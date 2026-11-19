# shared/demo

**Web apps only.** The three CLI pieces use [CLI_CONTRACT](../../docs/CLI_CONTRACT.md) and a labelled recorded-run page; there is no app UI.

Static GitHub Pages build of the real UI.

## Build

- Next.js `output: 'export'`, `basePath: '/<repo>'`, `images.unoptimized: true`.
- `NEXT_PUBLIC_DEMO_MODE=true` selects the client-side mock adapter.
- Publish `index.html` as `404.html`; include `.nojekyll`.
- All fonts, icons and data are local; no off-origin requests.
- No backend, CORS, keys or environment secrets.

## Visible truth

- A persistent **Sample data** label.
- A short “what is simulated” line in the UI and README.
- No client, production or result claim.

## Live checks

Run against the published URL:

1. Sample-data label renders.
2. One deep link boots.
3. Zero requests leave the origin.
4. Console is clean.
5. Core journey is usable at mobile width.

Record the date and result in `docs/verification.md`.
