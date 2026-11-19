import { defineConfig } from "@playwright/test";

// Test tooling: localhost targets and test-only env keys are expected here.
export default defineConfig({
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: `node e2e/serve.mjs`,
    url: "http://localhost:3000",
    env: { E2E_PYTHON: process.env.CLEAN_APP_TEST_PYTHON ?? "python" },
  },
});
