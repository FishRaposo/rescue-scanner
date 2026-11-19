// Shared ESLint baseline for the web repos — the ignore list every repo uses.
// The repo's own eslint.config.mjs composes it with eslint-config-next's flat
// entries (imported from the repo root so node_modules resolves naturally).
export const eslintIgnores = [
  "**/.next/**",
  "**/out/**",
  "node_modules/**",
  "site/**",
  "coverage/**",
  "playwright-report/**",
  "test-results/**",
];
