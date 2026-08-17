import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadCourse,
  loadCourseCollection,
  validateCourse,
  validateCourseCollection,
} from "./index.ts";

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

  it("enforces an opted-in discovery cycle", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "explorables-discovery-"));
    await fs.mkdir(path.join(root, "lessons"));
    await writePluginFiles(root, "discovery");
    await Promise.all([
      fs.writeFile(path.join(root, "README.md"), "# Course\n"),
      fs.writeFile(path.join(root, "AGENTS.md"), "# Tutor\n"),
      fs.writeFile(path.join(root, "CLAUDE.md"), "@AGENTS.md\n"),
      fs.writeFile(path.join(root, "package.json"), '{"private":true}\n'),
      fs.writeFile(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n"),
      fs.writeFile(
        path.join(root, "COURSE.md"),
        "---\nid: discovery\ntitle: Discovery\nversion: 0.1.0\nsummary: Discover.\nlicense: CC-BY-4.0\nguidance: {}\n---\n\n## Lessons\n\n1. [One](lessons/01.md)\n",
      ),
      fs.writeFile(
        path.join(root, "lessons", "01.md"),
        "---\nid: one\ntitle: One\ndiscoveryCycle: true\ncheckpoints:\n  - { id: explain, title: Explain, phase: reflect, completion: learner }\n  - { id: predict, title: Predict, phase: predict, completion: learner }\n---\n\n# One\n",
      ),
    ]);
    expect(await validateCourse(root)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-discovery-cycle" }),
        expect.objectContaining({ code: "missing-discovery-response" }),
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

  it("rejects Agent Skill names longer than 64 characters", async () => {
    const root = path.resolve(import.meta.dirname, "../../../examples/minimal-course");
    const temporary = await fs.mkdtemp(
      path.join(os.tmpdir(), "explorables-plugin-skill-name-"),
    );
    const skillName = "a".repeat(65);
    const skillDirectory = path.join(temporary, "skills", skillName);
    await fs.cp(root, temporary, { recursive: true });
    await fs.mkdir(skillDirectory);
    await Promise.all([
      fs.writeFile(path.join(temporary, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n"),
      fs.writeFile(
        path.join(skillDirectory, "SKILL.md"),
        `---\nname: ${skillName}\ndescription: Invalid overlong Agent Skill name.\n---\n\nInstructions.\n`,
      ),
    ]);

    expect(await validateCourse(temporary)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-agent-skill",
          message: expect.stringContaining("must be at most 64 characters"),
        }),
      ]),
    );
  });

  it("loads an explicit collection without exposing local course paths", async () => {
    const root = path.resolve(import.meta.dirname, "../../..");
    const collection = await loadCourseCollection(root);
    expect(collection.runtime.tracks[0]?.courses[0]).toMatchObject({
      id: "ai-from-first-principles",
      status: "available",
      lessonCount: 13,
    });
    expect(JSON.stringify(collection.runtime)).not.toContain(root);
    expect(await validateCourseCollection(root)).toEqual([]);
  });

  it("rejects collection paths outside the collection root", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "explorables-library-"));
    await fs.writeFile(
      path.join(root, "explorables.library.json"),
      JSON.stringify({
        schemaVersion: 1,
        title: "Unsafe",
        summary: "An unsafe collection.",
        tracks: [
          {
            id: "unsafe",
            title: "Unsafe",
            summary: "Must fail.",
            courses: [{ status: "available", path: "../outside" }],
          },
        ],
      }),
    );
    expect(await validateCourseCollection(root)).toEqual([
      expect.objectContaining({ code: "invalid-course-collection" }),
    ]);
  });
});
