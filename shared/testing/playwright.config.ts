/**
 * Playwright options factory — dependency-free so it resolves anywhere.
 * A consumer's playwright.config.ts looks like:
 *
 *   import { defineConfig } from "@playwright/test";
 *   import { makePlaywrightOptions } from "../shared/testing/playwright.config";
 *   export default defineConfig(
 *     makePlaywrightOptions({ port: 3111, command: "npm run serve:demo" }),
 *   );
 */
export function makePlaywrightOptions(opts: {
  port?: number;
  baseURL?: string;
  command?: string;
  testDir?: string;
}) {
  const port = opts.port ?? 3111;
  const baseURL = opts.baseURL ?? `http://127.0.0.1:${port}`;
  return {
    testDir: opts.testDir ?? "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
      baseURL,
      viewport: { width: 1280, height: 720 }, // Desktop Chrome
      screenshot: "only-on-failure" as const,
      trace: "retain-on-failure" as const,
    },
    projects: [{ name: "chromium", use: {} }],
    ...(opts.command
      ? {
          webServer: {
            command: opts.command,
            url: baseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        }
      : {}),
  };
}
