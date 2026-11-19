import { defineConfig } from "@playwright/test";
import { makePlaywrightOptions } from "./shared/testing/playwright.config";

// e2e runs against the built demo export served under the Pages base path.
// The repo's playwright.config.ts overrides baseURL/command with its
// rescue-scanner — see npm run serve:demo.
export default defineConfig(
  makePlaywrightOptions({
    port: 3111,
    baseURL: "http://127.0.0.1:3111/rescue-scanner/",
    command:
      "python scripts/serve_demo.py --port 3111 --base-path rescue-scanner",
    testDir: "./frontend/tests/e2e",
  }),
);
