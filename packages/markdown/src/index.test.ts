import { describe, expect, it } from "vitest";
import { lessonLinksFromCourse, renderMarkdown } from "./index.ts";

describe("Markdown", () => {
  it("sanitises raw scripts", async () => {
    const result = await renderMarkdown("# Hello\n\n<script>alert(1)</script>");
    expect(result.html).not.toContain("script");
    expect(result.html).toContain("Hello");
  });

  it("recognises only the two public directives", async () => {
    const result = await renderMarkdown(
      ':::explorable{src="../explorables/demo.ts" title="Demo"}\nFallback text.\n:::',
      "lesson.md",
      "lesson",
    );
    expect(result.explorables).toHaveLength(1);
    expect(result.html).toContain("data-explorable");
    await expect(renderMarkdown(":::quiz\nNo.\n:::", "lesson.md")).rejects.toThrow(
      "Only explorable and exercise",
    );
  });

  it("extracts ordered lesson links", () => {
    expect(
      lessonLinksFromCourse("1. [One](lessons/01.md)\n2. [Two](lessons/02.md)"),
    ).toEqual(["lessons/01.md", "lessons/02.md"]);
  });
});
