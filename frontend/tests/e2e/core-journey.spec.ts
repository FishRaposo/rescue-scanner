// The recruiter path: report home → severity counts → a finding detail →
// back to the rules+limits page. Zero console errors, zero a11y violations.
import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers/axe";

test("report journey completes without a console error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Rescue Scanner report" })).toBeVisible();
  await expect(page.getByText("engineering review, not a security certification")).toBeVisible();
  await expectNoA11yViolations(page);

  // Severity counts are rendered.
  await expect(page.getByText("high", { exact: true }).first()).toBeVisible();

  // Into a finding detail (the first table row's detail link).
  await page.getByRole("link", { name: "detail" }).first().click();
  await expect(page.getByText("Suggested remediation")).toBeVisible();
  await expectNoA11yViolations(page);

  // Back to rules page.
  await page.getByRole("link", { name: "← all findings" }).click();
  await page.getByRole("link", { name: /Rules applied and what each cannot see/ }).click();
  await expect(page.getByRole("heading", { name: /Rules applied/ })).toBeVisible();
  await expect(page.getByText("Cannot see").first()).toBeVisible();
  await expectNoA11yViolations(page);

  expect(errors).toEqual([]);
});
