// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { lessonBodyHtml } from "./lesson-html.ts";

describe("lesson body HTML", () => {
  it("removes a leading heading that duplicates the frontmatter title", () => {
    expect(
      lessonBodyHtml("<h1>Gradient descent</h1><p>Start here.</p>", "Gradient descent"),
    ).toBe("<p>Start here.</p>");
  });

  it("preserves a distinct or non-leading heading", () => {
    expect(lessonBodyHtml("<h1>A different title</h1>", "Lesson title")).toBe(
      "<h1>A different title</h1>",
    );
    expect(lessonBodyHtml("<p>Preface.</p><h1>Lesson title</h1>", "Lesson title")).toBe(
      "<p>Preface.</p><h1>Lesson title</h1>",
    );
  });
});
