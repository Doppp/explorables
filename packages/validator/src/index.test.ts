import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCourse, validateCourse } from "./index.ts";

describe("course validator", () => {
  it("validates the minimal first-party course", async () => {
    const root = path.resolve(import.meta.dirname, "../../../examples/minimal-course");
    const diagnostics = await validateCourse(root);
    expect(diagnostics).toEqual([]);
  });

  it("accepts a useful Markdown-only course and resolves its local assets", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "explorables-markdown-only-"));
    await fs.mkdir(path.join(root, "lessons"));
    await fs.mkdir(path.join(root, "assets"));
    await Promise.all([
      fs.writeFile(path.join(root, "README.md"), "# Course\n"),
      fs.writeFile(path.join(root, "AGENTS.md"), "# Tutor\n"),
      fs.writeFile(path.join(root, "CLAUDE.md"), "@AGENTS.md\n"),
      fs.writeFile(path.join(root, "package.json"), '{"private":true}\n'),
      fs.writeFile(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n"),
      fs.writeFile(path.join(root, "assets", "notes.txt"), "local asset\n"),
      fs.writeFile(
        path.join(root, "COURSE.md"),
        "---\nid: markdown-only\ntitle: Markdown only\nversion: 0.1.0\nsummary: No executable modules.\nlicense: CC-BY-4.0\n---\n\n## Lessons\n\n1. [Read](lessons/01.md)\n",
      ),
      fs.writeFile(
        path.join(root, "lessons", "01.md"),
        "---\nid: read\ntitle: Read\n---\n\n# Read\n\n[Local notes](../assets/notes.txt)\n",
      ),
    ]);
    expect(await validateCourse(root)).toEqual([]);
    const loaded = await loadCourse(root);
    expect(loaded.lessons[0]?.explorables).toEqual([]);
    expect(loaded.lessons[0]?.html).toContain('href="course-files/assets/notes.txt"');
  });
});
