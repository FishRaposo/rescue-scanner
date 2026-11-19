import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { makeVitestOptions } from "./shared/testing/vitest.config";

// Vite does not read tsconfig paths — declare the same aliases here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
      "@": fileURLToPath(new URL("./frontend", import.meta.url)),
    },
  },
  test: makeVitestOptions({
    setupFiles: ["./frontend/test/setup.ts"],
    include: [
      "frontend/**/*.{test,spec}.{ts,tsx}",
      "shared/**/*.{test,spec}.{ts,tsx}",
      "scanner/**/*.{test,spec}.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
  }),
});
