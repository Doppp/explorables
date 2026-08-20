import { expect, test } from "@playwright/test";

test("orients a beginner before the first prediction and technical lesson", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open course" }).click();

  await expect(
    page.getByRole("heading", { name: "AI from First Principles", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What you will learn" }),
  ).toBeVisible();
  await expect(
    page.getByText("no prior machine-learning or calculus knowledge"),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await page.setViewportSize({ width: 1156, height: 900 });
  await page.getByRole("button", { name: "Start course" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Generative AI and language models",
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.locator("#lesson")).toHaveAttribute(
    "data-explorables-teaching-mode",
    "tutor-led",
  );
  const lesson = page.locator(".tutor-led-lesson-body");
  await expect(
    lesson
      .locator(".tutor-handoff")
      .getByRole("heading", { name: "Classify a familiar AI product" }),
  ).toBeVisible();
  await expect(lesson.locator(".tutor-handoff")).toHaveAttribute(
    "data-tutor-checkpoint-id",
    "predict",
  );
  await expect(
    lesson.getByRole("heading", { name: "A nested map, not a bag of synonyms" }),
  ).toBeVisible();
  await expect(lesson.getByText("Artificial intelligence (AI)")).toBeVisible();
  const notes = lesson.locator(".lesson-reference-notes");
  await expect(notes).not.toHaveAttribute("open", "");
  await notes.getByText("Open worked explanation and recap").click();
  await expect(
    notes.getByRole("heading", { name: "Explain the evidence" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Switch to Explore mode" }).click();
  await page.getByRole("button", { name: "Enter Explore mode" }).click();
  await page.getByRole("link", { name: "Gradient descent" }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await expect(
    page.locator(".lesson-body").getByRole("heading", {
      name: "The smallest possible learning problem",
    }),
  ).toBeVisible();
  await expect(page.locator(".tutor-handoff")).toHaveCount(0);
});

test("keeps ordered-list markers inside explorable panels", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 820 });
  await page.goto("/");
  await page.getByRole("link", { name: "Open course" }).click();
  await page.getByRole("button", { name: "Start course" }).click();
  await page.locator("details.compact-course-contents > summary").click();
  await page.getByRole("button", { name: "Switch to Explore mode" }).click();
  await page.getByRole("button", { name: "Enter Explore mode" }).click();
  await page.getByRole("link", { name: "The next-token loop" }).click();
  const list = page.frameLocator("iframe").first().locator("ol.panel");
  await expect(list).toBeVisible();
  expect(
    await list.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).paddingInlineStart),
    ),
  ).toBeGreaterThanOrEqual(30);
});
