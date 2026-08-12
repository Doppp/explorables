import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { scaffoldCourse } from "./index.ts";

describe("course scaffold", () => {
  it("creates an Agent Plugins v1 course package", async () => {
    const parent = await fs.mkdtemp(path.join(os.tmpdir(), "explorables-scaffold-"));
    const target = path.join(parent, "Plugin Course");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await scaffoldCourse(target);
    log.mockRestore();

    const manifest = JSON.parse(
      await fs.readFile(path.join(target, "plugin.json"), "utf8"),
    );
    const skill = await fs.readFile(
      path.join(target, "skills", "start-course", "SKILL.md"),
      "utf8",
    );
    expect(manifest).toMatchObject({
      $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
      name: "plugin-course",
      version: "0.1.0",
    });
    expect(skill).toContain("name: start-course");
    expect(skill).toContain("../../AGENTS.md");
    expect(skill).not.toContain("TODO");
  });
});
