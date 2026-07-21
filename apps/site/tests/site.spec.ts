import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing page content, links, and accessibility", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "See how it works",
  );
  await expect(
    page.getByRole("heading", { name: "AI from First Principles" }),
  ).toBeVisible();
  await expect(
    page.getByText("No analytics. No cookies. No learner tracking."),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("stays usable in a narrow desktop preview", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  await expect(
    page.getByRole("link", { name: /Explore the first course/ }),
  ).toBeVisible();
});
