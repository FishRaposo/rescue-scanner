# Static demo contract (web apps)

**Web apps only.** Client Portal, Docs Answer and Triage Agent use this page. The three CLI pieces (Deploy Doctor, Rescue Scanner, Fix Bench) use [CLI_CONTRACT](CLI_CONTRACT.md); they have no app UI.

Every web app publishes a GitHub Pages demo of the **real UI**, not a separate mock page.

## Build

- Next.js static export (`output: 'export'`), `basePath: '/<repo>'`, `images.unoptimized: true`.
- API client switches to the client-side mock adapter when `NEXT_PUBLIC_DEMO_MODE=true`.
- The mock short-circuits in the client and returns deterministic fixtures; no backend, no CORS, no secrets.
- Publish `index.html` as `404.html`; include `.nojekyll`.
- Deploy with the repo's own Pages workflow to `fishraposo.github.io/<repo>/`.

## Visible truth

- A persistent **Sample data** label in the UI.
- The README states what is simulated and what the local run executes.
- No off-origin requests: fonts, images and data are local.
- No keys or environment secrets in the demo build.

## Live-URL checks

Run against the published URL, not localhost:

1. The sample-data label renders.
2. One deep link boots.
3. Zero requests leave the origin.
4. The console is clean.
5. The core journey is usable at mobile width.

Record the date and result in `docs/verification.md`.
