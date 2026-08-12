import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCourse, validateCourse } from "./index.ts";

const pluginManifest = (name: string, version = "0.1.0") =>
  JSON.stringify({
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name,
    version,
  });

const startCourseSkill = `---
name: start-course
description: Start and tutor this course when a learner asks to begin or continue it.
---

Read ../../AGENTS.md and follow it.
`;

async function writePluginFiles(root: string, name: string): Promise<void> {
  await fs.mkdir(path.join(root, "skills", "start-course"), { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(root, "plugin.json"), pluginManifest(name)),
    fs.writeFile(
      path.join(root, "skills", "start-course", "SKILL.md"),
      startCourseSkill,
    ),
  ]);
}

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
    await writePluginFiles(root, "markdown-only");
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

  it("reports invalid guided checkpoint declarations", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "explorables-guided-"));
    await fs.mkdir(path.join(root, "lessons"));
    await writePluginFiles(root, "guided");
    await Promise.all([
      fs.writeFile(path.join(root, "README.md"), "# Course\n"),
      fs.writeFile(path.join(root, "AGENTS.md"), "# Tutor\n"),
      fs.writeFile(path.join(root, "CLAUDE.md"), "@AGENTS.md\n"),
      fs.writeFile(path.join(root, "package.json"), '{"private":true}\n'),
      fs.writeFile(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n"),
      fs.writeFile(
        path.join(root, "COURSE.md"),
        "---\nid: guided\ntitle: Guided\nversion: 0.1.0\nsummary: Guided.\nlicense: CC-BY-4.0\nguidance: {}\n---\n\n## Lessons\n\n1. [One](lessons/01.md)\n",
      ),
      fs.writeFile(
        path.join(root, "lessons", "01.md"),
        "---\nid: one\ntitle: One\ncheckpoints:\n  - id: experiment\n    title: Experiment\n    completion: explorable-event\n    instanceId: absent\n    event: simulation-completed\n---\n\n# One\n",
      ),
    ]);
    expect(await validateCourse(root)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unknown-checkpoint-explorable" }),
      ]),
    );
  });

  it("rejects an invalid Agent Plugin manifest", async () => {
    const root = path.resolve(import.meta.dirname, "../../../examples/minimal-course");
    const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "explorables-plugin-"));
    await fs.cp(root, temporary, { recursive: true });
    await fs.writeFile(
      path.join(temporary, "pnpm-lock.yaml"),
      "lockfileVersion: '9.0'\n",
    );
    await fs.writeFile(
      path.join(temporary, "plugin.json"),
      pluginManifest("Different_Name"),
    );
    expect(await validateCourse(temporary)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-plugin-manifest" }),
      ]),
    );
  });

  it("rejects Agent Skill paths that escape the plugin root", async () => {
    const root = path.resolve(import.meta.dirname, "../../../examples/minimal-course");
    const temporary = await fs.mkdtemp(
      path.join(os.tmpdir(), "explorables-plugin-path-"),
    );
    const outside = await fs.mkdtemp(
      path.join(os.tmpdir(), "explorables-outside-skill-"),
    );
    await fs.cp(root, temporary, { recursive: true });
    await fs.writeFile(
      path.join(temporary, "pnpm-lock.yaml"),
      "lockfileVersion: '9.0'\n",
    );
    await fs.writeFile(path.join(outside, "SKILL.md"), startCourseSkill);
    await fs.rm(path.join(temporary, "skills", "start-course"), { recursive: true });
    await fs.symlink(outside, path.join(temporary, "skills", "start-course"));

    expect(await validateCourse(temporary)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-agent-skill",
          message: expect.stringContaining("outside the Agent Plugin root"),
        }),
      ]),
    );
  });
});
