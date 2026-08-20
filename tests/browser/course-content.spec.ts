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
    page.getByRole("heading", { name: "How machines learn", level: 1 }),
  ).toBeVisible();
  const lesson = page.locator(".discovery-lesson-body");
  await expect(
    lesson.getByRole("heading", { name: "What “AI” means in this course" }),
  ).toBeVisible();
  await expect(
    lesson.getByRole("heading", { name: "The six pieces of a learning loop" }),
  ).toBeVisible();
  await expect(
    lesson.getByText(/A machine-learning model instead contains adjustable values/),
  ).toBeVisible();
  await expect(
    lesson.getByText(/During training, the system has an example and its target/),
  ).toBeVisible();

  const sequence = await lesson.evaluate((root) => {
    const definitions = [...root.querySelectorAll("h2")].find(
      (heading) => heading.textContent?.trim() === "The six pieces of a learning loop",
    );
    const checkpoint = root.querySelector(".checkpoint-control-predict");
    const explorable = root.querySelector("[data-explorable]");
    if (!definitions || !checkpoint || !explorable) return null;
    return {
      definitionsBeforeCheckpoint: Boolean(
        definitions.compareDocumentPosition(checkpoint) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      checkpointBeforeExplorable: Boolean(
        checkpoint.compareDocumentPosition(explorable) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    };
  });

  expect(sequence).toEqual({
    definitionsBeforeCheckpoint: true,
    checkpointBeforeExplorable: true,
  });

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
});
