import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Run axe on the current page; fail on any violation. */
export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`,
  );
  expect(violations, `axe violations:\n${violations.join("\n")}`).toEqual([]);
}
