import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function openCompactContents(page: Page) {
  const compactContents = page.locator("details.compact-course-contents");
  if (
    (await compactContents.isVisible()) &&
    (await compactContents.getAttribute("open")) === null
  )
    await compactContents.locator(":scope > summary").click();
}

async function enterExploreMode(page: Page) {
  await openCompactContents(page);
  await page.getByRole("button", { name: "Switch to Explore mode" }).click();
  await page.getByRole("button", { name: "Enter Explore mode" }).click();
}

async function openFoundation(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Open course" }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
}

test("presents the local learning path and planned specializations honestly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "explorables Model-Learning Path",
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research Skills" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Model Specializations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Inside Kimi: From K2 and Kimi Linear to K3",
    }),
  ).toBeVisible();
  await expect(page.getByText("Not yet available")).toHaveCount(6);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("link", { name: "Open course" }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All courses" }).click();
  await expect(
    page.getByRole("heading", {
      name: "explorables Model-Learning Path",
      level: 1,
    }),
  ).toBeVisible();
});

test("follows the system theme, syncs explorables, and persists an override", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  const palette = () =>
    page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        canvas: styles.getPropertyValue("--canvas").trim(),
        sage: styles.getPropertyValue("--sage").trim(),
        primary: styles.getPropertyValue("--primary").trim(),
      };
    });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Dark mode", pressed: true }),
  ).toBeVisible();
  await expect.poll(palette).toEqual({
    canvas: "#171b20",
    sage: "#25372f",
    primary: "#b4d9c3",
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("button", { name: "Dark mode", pressed: false }),
  ).toBeVisible();
  await expect.poll(palette).toEqual({
    canvas: "#f7f3ea",
    sage: "#e8efe5",
    primary: "#365b4b",
  });
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("explorables:theme")))
    .toBe("light");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Open course" }).click();
  const frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Walk the loss curve" }),
  ).toBeVisible();
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      frame.locator("html").evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          canvas: styles.getPropertyValue("--canvas").trim(),
          accent: styles.getPropertyValue("--accent").trim(),
        };
      }),
    )
    .toEqual({ canvas: "#20262c", accent: "#b4d9c3" });
  expect(
    (await new AxeBuilder({ page }).exclude("iframe").analyze()).violations,
  ).toEqual([]);
});

test("lets the library header use its full responsive container", async ({ page }) => {
  for (const width of [320, 720, 1156, 1427]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("h1.library-title")).toHaveText(
      "explorables Model-Learning Path",
    );
    const metrics = await page.evaluate(() => {
      const library = document.querySelector<HTMLElement>(".course-library");
      const hero = document.querySelector<HTMLElement>(".library-hero");
      const note = document.querySelector<HTMLElement>(".local-note");
      const title = document.querySelector<HTMLElement>(".library-title");
      if (!library || !hero || !note || !title)
        throw new Error("Expected library header elements");
      const titleStyles = getComputedStyle(title);
      return {
        overflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        libraryWidth: library.getBoundingClientRect().width,
        heroWidth: hero.getBoundingClientRect().width,
        noteWidth: note.getBoundingClientRect().width,
        titleHeight: title.getBoundingClientRect().height,
        titleLineHeight: Number.parseFloat(titleStyles.lineHeight),
      };
    });
    expect(metrics.overflow).toBe(false);
    expect(Math.abs(metrics.heroWidth - metrics.libraryWidth)).toBeLessThan(1);
    expect(Math.abs(metrics.noteWidth - metrics.heroWidth)).toBeLessThan(1);
    if (width >= 1156)
      expect(metrics.titleHeight / metrics.titleLineHeight).toBeLessThan(1.5);
  }
});

test("rejects unknown collection courses and escaped asset requests", async ({
  request,
}) => {
  const unknown = await request.get("/courses/not-installed/course.json");
  expect(unknown.status()).toBe(404);
  const escaped = await request.get(
    "/courses/ai-from-first-principles/course-files/%2e%2e%2f%2e%2e%2fpackage.json",
  );
  expect(escaped.status()).not.toBe(200);
});

test("guides progress, records interaction, and resumes locally", async ({ page }) => {
  await openFoundation(page);
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Mode: Guided")).toBeVisible();
  await expect(page.getByText("0 of 4")).toBeVisible();
  await expect(
    page.locator(".lesson-locked").filter({ hasText: "Backpropagation" }),
  ).toContainText("Locked");
  await expect(page.getByRole("button", { name: "Backpropagation →" })).toBeDisabled();
  const iframe = page.locator("iframe").first();
  await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  await expect(iframe).not.toHaveAttribute("sandbox", /allow-same-origin/);
  const frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Walk the loss curve" }),
  ).toBeVisible();
  await frame.getByRole("button", { name: "Take one step" }).click();
  await expect(page.getByText("0 of 4")).toBeVisible();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "Attempt the exercise and run its tests" }),
  ).toContainText("Available after the prior checkpoint");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Record your prediction" })
    .getByRole("button", { name: "Mark complete" })
    .click();
  await frame.getByRole("button", { name: "Take one step" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "simulation-completed" }),
  ).toBeVisible();
  await expect(page.getByText("2 of 4")).toBeVisible();
  for (const title of [
    "Attempt the exercise and run its tests",
    "Explain the result and one failure mode",
  ]) {
    await page
      .getByRole("listitem")
      .filter({ hasText: title })
      .getByRole("button", { name: "Mark complete" })
      .click();
  }
  await page.getByRole("button", { name: "Backpropagation →" }).click();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Gradient descent Done" })).toBeVisible();
});

test("keeps the lesson first and course contents compact at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openFoundation(page);

  const contents = page.locator("details.compact-course-contents");
  await expect(contents).not.toHaveAttribute("open", "");
  const sidebarHeight = await page
    .locator(".course-sidebar")
    .evaluate((element) => element.getBoundingClientRect().height);
  const headingTop = await page
    .getByRole("heading", { name: "Gradient descent", level: 1 })
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(sidebarHeight).toBeLessThan(220);
  expect(headingTop).toBeLessThan(360);
  await expect(page.locator("main h1")).toHaveCount(1);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
  expect(results.violations).toEqual([]);

  await contents.locator(":scope > summary").click();
  await expect(
    page.getByRole("link", { name: "Gradient descent Current" }),
  ).toBeVisible();
});

test("preserves an unfinished parked question across the navigation breakpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await openFoundation(page);
  await page.getByText("Question parking lot (0)").click();
  await page.getByLabel("Question to revisit").fill("How does routing work?");

  await page.setViewportSize({ width: 800, height: 900 });
  const contents = page.locator("details.compact-course-contents");
  await expect(contents).not.toHaveAttribute("open", "");
  await contents.locator(":scope > summary").click();
  await expect(page.getByLabel("Question to revisit")).toHaveValue(
    "How does routing work?",
  );
});

test("recovers locked deep links and supports parking, skipping, explore, and reset", async ({
  page,
}) => {
  await page.goto("/#/courses/ai-from-first-principles/lessons/sampling");
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(/That lesson is still ahead/)).toBeVisible();
  await page.getByText("Question parking lot (0)").click();
  await page.getByLabel("Question to revisit").fill("How does MoE routing work?");
  await page.getByRole("button", { name: "Park question" }).click();
  await expect(page.getByText("Question parking lot (1)")).toBeVisible();
  await page.getByRole("button", { name: "Skip lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
  await enterExploreMode(page);
  await page.getByRole("link", { name: "Sampling and generation" }).click();
  await expect(
    page.getByRole("heading", { name: "Sampling and generation", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return to Guided mode" }).click();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset local progress" }).click();
  await page.getByRole("button", { name: "Reset progress", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Question parking lot (0)")).toBeVisible();
});

test("new foundation lessons expose recoverable failures and training state", async ({
  page,
}) => {
  await openFoundation(page);
  await enterExploreMode(page);
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
  await expect(
    page.getByRole("status").filter({ hasText: "simulation-completed" }),
  ).toBeVisible();
});

test("Transformer foundation lessons expose their core invariants", async ({
  page,
}) => {
  await openFoundation(page);
  await enterExploreMode(page);
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
  await expect(
    page.getByRole("status").filter({ hasText: "simulation-completed" }),
  ).toBeVisible();
  await frame
    .getByRole("checkbox", {
      name: "Use the current token as its own target (broken)",
    })
    .check();
  await expect(
    frame.getByText(/identity-biased model appears accurate/i),
  ).toBeVisible();
});

test("inference and capstone preserve cache equivalence and expose invalid claims", async ({
  page,
}) => {
  await openFoundation(page);
  await enterExploreMode(page);
  await page
    .getByRole("link", { name: "Autoregressive inference and KV caching" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Autoregressive inference and KV caching",
      level: 1,
    }),
  ).toBeVisible();
  const cacheFrame = page.frameLocator("iframe").nth(0);
  await expect(
    cacheFrame.getByRole("heading", {
      name: "Reuse the past without changing the answer",
    }),
  ).toBeVisible();
  await expect(
    cacheFrame.getByText("maximum output difference: 0.000000"),
  ).toBeVisible();
  await cacheFrame
    .getByRole("checkbox", {
      name: "Keep only the newest key and value (broken)",
    })
    .check();
  await expect(
    cacheFrame.getByText(/current query can no longer attend to earlier tokens/),
  ).toBeVisible();

  const capstoneFrame = page.frameLocator("iframe").nth(1);
  await expect(
    capstoneFrame.getByRole("heading", {
      name: "Train, generate, and challenge the claim",
    }),
  ).toBeVisible();
  await capstoneFrame.getByRole("button", { name: "Train" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "simulation-completed" }),
  ).toBeVisible();
  await capstoneFrame
    .getByRole("checkbox", {
      name: "Evaluate on training tokens (broken claim)",
    })
    .check();
  await expect(capstoneFrame.getByText(/cannot support a held-out/)).toBeVisible();
});

test("course shell passes axe and fits a narrow preview pane", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await openFoundation(page);
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
  expect(results.violations).toEqual([]);

  await enterExploreMode(page);
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

  await openCompactContents(page);
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

  await openCompactContents(page);
  await page
    .getByRole("link", { name: "Autoregressive inference and KV caching" })
    .click();
  const inferenceFrame = page.frameLocator("iframe").first();
  await expect(
    inferenceFrame.getByRole("heading", {
      name: "Reuse the past without changing the answer",
    }),
  ).toBeVisible();
  const inferenceOverflow = await inferenceFrame
    .locator("html")
    .evaluate(
      (documentElement) => documentElement.scrollWidth > documentElement.clientWidth,
    );
  expect(inferenceOverflow).toBe(false);
});
