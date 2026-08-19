import { expect, test } from "@playwright/test";

test("renders the canonical beginner explanation around the explorable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open course" }).click();

  const lesson = page.locator(".lesson-body");
  await expect(
    lesson.getByRole("heading", {
      name: "The smallest possible learning problem",
    }),
  ).toBeVisible();
  await expect(
    lesson.getByText(/A model is a rule that turns an input into a prediction/),
  ).toBeVisible();
  await expect(
    lesson.getByText(/Parameter.*adjustable number stored by the model/),
  ).toBeVisible();
  await expect(
    lesson.getByText(/Training means using targets and loss to adjust parameters/),
  ).toBeVisible();
  await expect(
    lesson.getByRole("heading", { name: "Explain what you observed" }),
  ).toBeVisible();
  await expect(
    lesson.getByRole("heading", { name: "Recap and self-check" }),
  ).toBeVisible();

  const sequence = await lesson.evaluate((root) => {
    const headings = [...root.querySelectorAll("h2")];
    const orientation = headings.find(
      (heading) =>
        heading.textContent?.trim() === "The smallest possible learning problem",
    );
    const explanation = headings.find(
      (heading) => heading.textContent?.trim() === "Explain what you observed",
    );
    const explorable = root.querySelector(".explorable");
    if (!orientation || !explorable || !explanation) return null;
    return {
      orientationBeforeExplorable: Boolean(
        orientation.compareDocumentPosition(explorable) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      explanationAfterExplorable: Boolean(
        explorable.compareDocumentPosition(explanation) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    };
  });

  expect(sequence).toEqual({
    orientationBeforeExplorable: true,
    explanationAfterExplorable: true,
  });
});
