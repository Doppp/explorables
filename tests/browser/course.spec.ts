import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders all lessons and a restricted interactive iframe", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Course lessons" }).getByRole("link"),
  ).toHaveCount(6);
  const iframe = page.locator("iframe").first();
  await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  await expect(iframe).not.toHaveAttribute("sandbox", /allow-same-origin/);
  const frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Walk the loss curve" }),
  ).toBeVisible();
  await frame.getByRole("button", { name: "Take one step" }).click();
  await expect(page.getByRole("status")).toContainText("simulation-completed");
  await page.getByRole("link", { name: "Backpropagation" }).click();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
});

test("course shell passes axe and fits a narrow preview pane", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
  expect(results.violations).toEqual([]);
});
