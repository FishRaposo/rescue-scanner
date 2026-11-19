// A shared URL to a finding detail must boot directly, under the basePath.
import { expect, test } from "@playwright/test";

test("finding deep link boots", async ({ page }) => {
  const response = await page.goto("findings/f-03/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("h1")).not.toBeEmpty();
  await expect(page.getByText("Evidence")).toBeVisible();
  await expect(page.getByText(/What this rule cannot see/)).toBeVisible();
});
