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
    page.getByRole("heading", { name: "AI from First Principles", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Course overview", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start course" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Generative AI and language models",
      level: 1,
    }),
  ).toBeVisible();
  await page
    .getByLabel(
      "Is a photo classifier generative AI, and is a chatbot the same thing as the language model inside it? Explain your current guess.",
    )
    .fill("A classifier is learned but not generative; a chatbot surrounds its LLM.");
  await page.getByRole("button", { name: "Save response" }).click();
  await page
    .frameLocator("iframe")
    .first()
    .getByRole("button", { name: "Save this classification" })
    .click();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await page
    .getByLabel(
      "Explain how AI, machine learning, generative AI, an LLM, and a chatbot product relate without using them as synonyms.",
    )
    .fill(
      "AI is broad; ML learns; generative AI creates; an LLM models language; a chatbot is a product around it.",
    );
  await page.getByRole("button", { name: "Save response" }).click();
  await page.getByRole("button", { name: "The next-token loop →" }).click();
  await page
    .getByLabel(
      "If a model assigns 55% to ‘sat’, 30% to ‘slept’, and 15% to ‘purred’, must it always choose ‘sat’? What becomes the next input?",
    )
    .fill("It can sample another token; the selected token joins the growing context.");
  await page.getByRole("button", { name: "Save response" }).click();
  await page
    .frameLocator("iframe")
    .first()
    .getByRole("button", { name: "Generate one token" })
    .click();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await page
    .getByLabel(
      "Explain how tokens, next-token probabilities, selection, and the growing context turn one prediction into generated text.",
    )
    .fill(
      "The model scores tokens, decoding selects one, and that token extends the next input.",
    );
  await page.getByRole("button", { name: "Save response" }).click();
  await page.getByRole("button", { name: "How machines learn →" }).click();
  await page
    .getByLabel(
      "Which value should training change: the input, the target, or the model parameter—and should inference change it too?",
    )
    .fill(
      "Training should change the model parameter; inference should leave it fixed.",
    );
  await page.getByRole("button", { name: "Save response" }).click();
  const frame = page.frameLocator("iframe").first();
  await frame.getByRole("button", { name: "Train one step and save evidence" }).click();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await page
    .getByLabel(
      "In your own words, how do prediction, target, loss, and parameter update form a training loop, and what is missing during inference?",
    )
    .fill(
      "Training compares a prediction with a target, measures loss, and updates a parameter. Inference has no target or update.",
    );
  await page.getByRole("button", { name: "Save response" }).click();
  await page.getByRole("button", { name: "Gradient descent →" }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
}

test("presents a general course library and planned specializations honestly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Learn by exploring, coding, and testing.",
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explorables course library" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Available now" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On the roadmap" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Frontier-model research" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Model Specializations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Inside Kimi: From K2 and Kimi Linear to K3",
    }),
  ).toBeVisible();
  await expect(page.getByText("Coming later")).toHaveCount(6);
  await expect(page.getByText("explorables Model-Learning Path")).toHaveCount(0);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("link", { name: "Open course" }).click();
  await expect(
    page.getByRole("heading", { name: "AI from First Principles", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What you will learn" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start course" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "All courses" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Learn by exploring, coding, and testing.",
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
  const typography = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const action = document.querySelector<HTMLElement>(".course-action");
    if (!action) throw new Error("Expected a course action");
    const courseAction = getComputedStyle(action);
    return {
      fontFamily: body.fontFamily,
      fontSmoothing: body.getPropertyValue("-webkit-font-smoothing"),
      textRendering: body.textRendering,
      courseActionWeight: courseAction.fontWeight,
    };
  });
  expect(typography.fontFamily).not.toContain("Avenir");
  expect(typography).toMatchObject({
    fontSmoothing: "antialiased",
    textRendering: "auto",
    courseActionWeight: "700",
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
  await page.getByRole("button", { name: "Start course" }).click();
  const frame = page.frameLocator("iframe").first();
  await expect(
    frame.getByRole("heading", { name: "Map the terms onto real systems" }),
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

test("keeps the general course library responsive", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 700 },
    { width: 720, height: 800 },
    { width: 900, height: 700 },
    { width: 1100, height: 760 },
    { width: 1427, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("h1.library-title")).toHaveText(
      "Learn by exploring, coding, and testing.",
    );
    const metrics = await page.evaluate(() => {
      const library = document.querySelector<HTMLElement>(".course-library");
      const hero = document.querySelector<HTMLElement>(".library-hero");
      const note = document.querySelector<HTMLElement>(".local-note");
      const title = document.querySelector<HTMLElement>(".library-title");
      const masthead = document.querySelector<HTMLElement>(".library-masthead");
      const eyebrow = document.querySelector<HTMLElement>(".library-eyebrow");
      const introduction = document.querySelector<HTMLElement>(".library-introduction");
      const available = document.querySelector<HTMLElement>(".available-courses");
      if (
        !library ||
        !hero ||
        !note ||
        !title ||
        !masthead ||
        !eyebrow ||
        !introduction ||
        !available
      )
        throw new Error("Expected library header elements");
      const titleStyles = getComputedStyle(title);
      const titleLineHeight = Number.parseFloat(titleStyles.lineHeight);
      const titleRect = title.getBoundingClientRect();
      const introductionRect = introduction.getBoundingClientRect();
      return {
        overflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        libraryWidth: library.getBoundingClientRect().width,
        heroWidth: hero.getBoundingClientRect().width,
        noteWidth: note.getBoundingClientRect().width,
        titleWidth: titleRect.width,
        availableWidth: available.getBoundingClientRect().width,
        mastheadToContentGap:
          eyebrow.getBoundingClientRect().top - masthead.getBoundingClientRect().bottom,
        heroToCoursesGap:
          available.getBoundingClientRect().top - note.getBoundingClientRect().bottom,
        titleLines: titleRect.height / titleLineHeight,
        introductionTop: introductionRect.top,
        introductionLeft: introductionRect.left,
        titleBottom: titleRect.bottom,
        titleLeft: titleRect.left,
        titleRight: titleRect.right,
      };
    });
    expect(metrics.overflow).toBe(false);
    expect(Math.abs(metrics.heroWidth - metrics.libraryWidth)).toBeLessThan(1);
    expect(Math.abs(metrics.availableWidth - metrics.libraryWidth)).toBeLessThan(1);
    expect(metrics.noteWidth).toBeLessThanOrEqual(metrics.heroWidth);
    expect(metrics.titleWidth).toBeLessThanOrEqual(metrics.heroWidth);
    expect(metrics.mastheadToContentGap).toBeLessThanOrEqual(70);
    expect(metrics.heroToCoursesGap).toBeLessThanOrEqual(70);
    if (viewport.width >= 720) expect(metrics.titleLines).toBeLessThanOrEqual(3.1);
    if (viewport.width <= 1120) {
      expect(metrics.introductionTop).toBeGreaterThan(metrics.titleBottom);
      expect(Math.abs(metrics.introductionLeft - metrics.titleLeft)).toBeLessThan(1);
    } else {
      expect(metrics.introductionLeft).toBeGreaterThan(metrics.titleLeft);
      expect(metrics.introductionLeft - metrics.titleRight).toBeLessThan(200);
    }
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
  await expect(page.locator("#lesson")).toHaveAttribute(
    "data-explorables-checkpoint-id",
    "predict",
  );
  await expect(page.locator("#lesson")).toHaveAttribute(
    "data-explorables-persistence",
    "available",
  );
  await expect(page.getByText("0 of 4")).toBeVisible();
  await expect(
    page.locator(".lesson-locked").filter({ hasText: "Backpropagation" }),
  ).toContainText("Locked");
  await expect(page.getByRole("button", { name: "Backpropagation →" })).toBeDisabled();
  const predictionControl = page.locator(".checkpoint-control-predict");
  const lessonBody = page.locator(".tutor-led-lesson-body");
  await expect(predictionControl).toBeVisible();
  expect(
    await lessonBody.evaluate((root) => {
      const checkpoint = root.querySelector(".checkpoint-control-predict");
      const explorable = root.querySelector("[data-explorable]");
      const notes = root.querySelector<HTMLDetailsElement>(".lesson-reference-notes");
      if (!checkpoint || !explorable || !notes) return false;
      return (
        !notes.open &&
        Boolean(
          checkpoint.compareDocumentPosition(explorable) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        )
      );
    }),
  ).toBe(true);
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
    .getByLabel(
      "Will a rate of 1.1 make the distance from the minimum shrink, stay fixed, or grow—and will θ cross the minimum?",
    )
    .fill("It will diverge because each step overshoots farther.");
  await page.getByRole("button", { name: "Save response" }).click();
  await frame.getByRole("button", { name: "Run four steps and save evidence" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "experiment-recorded" }),
  ).toBeVisible();
  await expect(page.getByText("2 of 4")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Experiment journal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "rate 0.20" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await frame.getByLabel("Learning rate").fill("1.1");
  await frame.getByRole("button", { name: "Run four steps and save evidence" }).click();
  await expect(page.getByRole("button", { name: "rate 1.10" })).toBeVisible();
  await expect(page.getByRole("table")).toContainText("diverging");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download journal" }).click();
  await expect((await download).suggestedFilename()).toBe(
    "gradient-descent-learning-journal.json",
  );
  await page
    .locator(".checkpoint-control-apply")
    .getByRole("button", { name: "Mark complete" })
    .click();
  await page
    .getByLabel(
      "What evidence confirmed or changed your model, and where does it fail?",
    )
    .fill(
      "The loss grew at rate 1.1; smaller rates reduced it. Adaptive updates differ.",
    );
  await page.getByRole("button", { name: "Save response" }).click();
  await page.getByRole("button", { name: "Backpropagation →" }).click();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Backpropagation", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Gradient descent Done" })).toBeVisible();
  await page.getByText("Session and saved progress").click();
  await expect(
    page.getByRole("heading", { name: "Your progress is saved" }),
  ).toBeVisible();
  await expect(page.getByText(/Saved at Backpropagation/)).toBeVisible();
  await expect(page.locator("#lesson")).toHaveAttribute(
    "data-explorables-guided-lesson-id",
    "backpropagation",
  );
});

test("explains session phrases and confirms checkpoint rollback", async ({ page }) => {
  await openFoundation(page);
  await page.getByText("Session and saved progress").click();
  await page.getByText("How to pause, resume, or change position").click();
  for (const phrase of [
    "Pause this course",
    "Resume this course",
    "Review lesson …",
    "Explore lesson …",
    "Restart from checkpoint …",
    "Finish the course",
  ])
    await expect(page.getByText(phrase, { exact: true })).toBeVisible();

  await page
    .getByLabel(
      "Will a rate of 1.1 make the distance from the minimum shrink, stay fixed, or grow—and will θ cross the minimum?",
    )
    .fill("It will diverge.");
  await page.getByRole("button", { name: "Save response" }).click();
  await page.reload();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Record your prediction" })
    .getByRole("button", { name: "Restart here" })
    .click();
  await page.getByRole("button", { name: "Confirm restart" }).click();
  await expect(page.getByText("0 of 4")).toBeVisible();
});

test("removes later discovery evidence when restarting its checkpoint", async ({
  page,
}) => {
  await openFoundation(page);
  await page
    .getByLabel(
      "Will a rate of 1.1 make the distance from the minimum shrink, stay fixed, or grow—and will θ cross the minimum?",
    )
    .fill("It will diverge.");
  await page.getByRole("button", { name: "Save response" }).click();
  const frame = page.frameLocator("iframe").first();
  await frame.getByRole("button", { name: "Run four steps and save evidence" }).click();
  await expect(page.getByRole("heading", { name: "Experiment journal" })).toBeVisible();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Run and save the gradient-step experiment" })
    .getByRole("button", { name: "Restart here" })
    .click();
  await page.getByRole("button", { name: "Confirm restart" }).click();
  await expect(page.getByText("1 of 4")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Experiment journal" })).toHaveCount(
    0,
  );
  await expect(page.getByText("It will diverge.", { exact: true })).toBeVisible();
});

test("warns when browser progress storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage disabled");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage disabled");
    };
  });
  await openFoundation(page);
  await page.getByText("Session and saved progress").click();
  await expect(
    page.getByText(
      "Browser storage is unavailable. Progress will last only for this open page.",
    ),
  ).toBeVisible();
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
    page.getByRole("heading", {
      name: "Generative AI and language models",
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.getByText(/That lesson is still ahead/)).toBeVisible();
  await page.getByText("Question parking lot (0)").click();
  await page.getByLabel("Question to revisit").fill("How does MoE routing work?");
  await page.getByRole("button", { name: "Park question" }).click();
  await expect(page.getByText("Question parking lot (1)")).toBeVisible();
  await page.getByRole("button", { name: "Skip lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "The next-token loop", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "How machines learn", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await enterExploreMode(page);
  await page.getByRole("link", { name: "Sampling and generation" }).click();
  await expect(
    page.getByRole("heading", { name: "Sampling and generation", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return to Guided mode" }).click();
  await expect(
    page.getByRole("heading", { name: "Gradient descent", level: 1 }),
  ).toBeVisible();
  await page.getByText("Session and saved progress").click();
  await page.getByText("How to pause, resume, or change position").click();
  await page.getByRole("button", { name: "Reset this course" }).click();
  await page.getByRole("button", { name: "Reset course", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Generative AI and language models",
      level: 1,
    }),
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

  const atlasFrame = page.frameLocator("iframe").nth(1);
  await expect(
    atlasFrame.getByRole("heading", {
      name: "Walk one prediction through the model compared with GPT-2 small",
    }),
  ).toBeVisible();
  await expect(atlasFrame.getByText("1.000", { exact: true })).toBeVisible();
  await atlasFrame
    .getByLabel("Model shown in the atlas")
    .selectOption({ label: "GPT-4 disclosure boundary" });
  await expect(
    atlasFrame.getByRole("heading", { name: "GPT-4 disclosure boundary" }).last(),
  ).toBeVisible();
  await atlasFrame
    .getByRole("button", { name: "2. Architecture intentionally undisclosed" })
    .click();
  await expect(atlasFrame.getByText("undisclosed evidence")).toBeVisible();
  await expect(atlasFrame.getByRole("table").first()).toContainText(
    "Not disclosed here",
  );
  await atlasFrame
    .getByLabel("Model shown in the atlas")
    .selectOption({ label: "DeepSeek V4 family" });
  await atlasFrame.getByRole("button", { name: "2. CSA/HCA hybrid attention" }).click();
  await expect(atlasFrame.getByText("report-derived evidence")).toBeVisible();

  const capstoneFrame = page.frameLocator("iframe").nth(2);
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

  const atlasFrame = page.frameLocator("iframe").nth(1);
  await expect(atlasFrame.getByLabel("Model shown in the atlas")).toBeVisible();
  const atlasOverflow = await atlasFrame
    .locator("html")
    .evaluate(
      (documentElement) => documentElement.scrollWidth > documentElement.clientWidth,
    );
  expect(atlasOverflow).toBe(false);
});
