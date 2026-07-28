import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders all lessons and a restricted interactive iframe", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Course lessons" }).getByRole("link"),
  ).toHaveCount(12);
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

test("new foundation lessons expose recoverable failures and training state", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Vectors, matrices, and linear layers" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Vectors, matrices, and linear layers",
      level: 1,
    }),
  ).toBeVisible();
  let frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Trace a linear projection" }),
  ).toBeVisible();
  await frame
    .getByRole("checkbox", { name: "Transpose W before multiplying (broken)" })
    .check();
  await expect(frame.getByText(/Shape error:/)).toBeVisible();
  await frame
    .getByRole("checkbox", { name: "Transpose W before multiplying (broken)" })
    .uncheck();
  await expect(frame.getByText("Output vector:", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: "Losses and optimisers" }).click();
  frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Train a tiny linear classifier" }),
  ).toBeVisible();
  await frame.getByLabel("Shared logit offset").fill("1000");
  await frame.getByRole("checkbox", { name: "Use naive softmax (broken)" }).check();
  await expect(frame.getByText(/Naive exponentiation overflowed/)).toBeVisible();
  await expect(
    frame.getByRole("button", { name: "Take one training step" }),
  ).toBeDisabled();
  await frame.getByRole("checkbox", { name: "Use naive softmax (broken)" }).uncheck();
  await frame.getByRole("button", { name: "Take one training step" }).click();
  await expect(page.getByRole("status")).toContainText("simulation-completed");
});

test("Transformer foundation lessons expose their core invariants", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Embeddings and positional information" })
    .click();
  let frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", {
      name: "Look up a token, then rotate its coordinates",
    }),
  ).toBeVisible();
  await frame.getByRole("slider", { name: "Position", exact: true }).fill("7");
  await frame
    .getByRole("checkbox", {
      name: "Add position to every coordinate (broken)",
    })
    .check();
  await expect(
    frame.getByText(/Adding the position changes the vector norm/),
  ).toBeVisible();

  await page.getByRole("link", { name: "Multi-head attention" }).click();
  frame = page.frameLocator("iframe").first();
  await frame
    .getByRole("checkbox", {
      name: "Reuse head 1 features for both heads (broken)",
    })
    .check();
  await expect(
    frame.getByText(/Both heads now receive the same feature slice/),
  ).toBeVisible();

  await page.getByRole("link", { name: "The Transformer block" }).click();
  frame = page.frameLocator("iframe").first();
  await frame
    .getByRole("checkbox", {
      name: "Replace instead of add residuals (broken)",
    })
    .check();
  await expect(frame.getByText(/removes the identity path/)).toBeVisible();

  await page.getByRole("link", { name: "Next-token training" }).click();
  frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Shift the targets, then train" }),
  ).toBeVisible();
  await frame.getByRole("button", { name: "Take one training step" }).click();
  await expect(page.getByRole("status")).toContainText("simulation-completed");
  await frame
    .getByRole("checkbox", {
      name: "Use the current token as its own target (broken)",
    })
    .check();
  await expect(
    frame.getByText(/identity-biased model appears accurate/i),
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

  await page.getByRole("link", { name: "Losses and optimisers" }).click();
  const frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Train a tiny linear classifier" }),
  ).toBeVisible();
  const frameOverflow = await frame
    .locator("html")
    .evaluate(
      (documentElement) => documentElement.scrollWidth > documentElement.clientWidth,
    );
  expect(frameOverflow).toBe(false);

  await page.getByRole("link", { name: "Next-token training" }).click();
  const trainingFrame = page.frameLocator("iframe").first();
  await expect(
    trainingFrame.getByRole("heading", { name: "Shift the targets, then train" }),
  ).toBeVisible();
  const trainingOverflow = await trainingFrame
    .locator("html")
    .evaluate(
      (documentElement) => documentElement.scrollWidth > documentElement.clientWidth,
    );
  expect(trainingOverflow).toBe(false);
});
