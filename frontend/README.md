# Frontend

Next.js + React + TypeScript + Tailwind.

## Rules

- One design language shared across the six repos; only the accent changes.
- The API client has a mock adapter selected by `NEXT_PUBLIC_DEMO_MODE`.
- The mock adapter returns deterministic fixtures in the client; no fetch, no CORS.
- The same components render in demo and local modes.
- Static export must work with `basePath` and `404.html`.
- Accessible: keyboard paths, 44px targets, contrast, reduced motion.
- No off-origin fonts or assets.

## Tests

- Vitest for components and state.
- Playwright for the core journey and the demo deep link.
- axe on the key screens.
