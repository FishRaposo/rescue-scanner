/**
 * Vitest options factory — dependency-free so it resolves anywhere.
 * The repo's vitest.config.ts lives at the repo root (node_modules is a
 * common ancestor of frontend/ and shared/) and looks like:
 *
 *   import react from "@vitejs/plugin-react";
 *   import { defineConfig } from "vitest/config";
 *   import { makeVitestOptions } from "./shared/testing/vitest.config";
 *   export default defineConfig({
 *     plugins: [react()],
 *     test: makeVitestOptions({ setupFiles: ["./frontend/test/setup.ts"] }),
 *   });
 */
export function makeVitestOptions(overrides: Record<string, unknown> = {}) {
  return {
    environment: "jsdom",
    globals: true,
    include: [
      "frontend/**/*.{test,spec}.{ts,tsx}",
      "shared/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "frontend/tests/e2e/**",
      "**/out/**",
      "**/.next/**",
    ],
    ...overrides,
  };
}
