import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import {
  agentPluginManifestSchema,
  agentSkillFrontmatterSchema,
  type CourseFrontmatter,
  courseFrontmatterSchema,
  type Diagnostic,
  exerciseManifestSchema,
  type ParsedLesson,
  type RuntimeCourse,
  type RuntimeExplorable,
} from "@explorables/course-schema";
import {
  lessonLinksFromCourse,
  parseLesson,
  renderMarkdown,
  resolveCoursePath,
} from "@explorables/markdown";
import { bundleExplorable } from "@explorables/sandbox";
import matter from "gray-matter";
import { ZodError } from "zod";

const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "COURSE.md",
  "package.json",
  "plugin.json",
  "skills/start-course/SKILL.md",
];

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function isContained(root: string, target: string): Promise<boolean> {
  const [realRoot, realTarget] = await Promise.all([
    fs.realpath(root),
    fs.realpath(target),
  ]);
  const relative = path.relative(realRoot, realTarget);
  return (
    relative === "" ||
    (relative !== ".." &&
      !path.isAbsolute(relative) &&
      !relative.startsWith(`..${path.sep}`))
  );
}

function diagnostic(
  file: string,
  code: string,
  message: string,
  line = 1,
  column = 1,
  severity: Diagnostic["severity"] = "error",
): Diagnostic {
  return { file, code, message, line, column, severity };
}

function messageFor(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
  }
  return error instanceof Error ? error.message : String(error);
}

export interface LoadedCourse {
  root: string;
  frontmatter: CourseFrontmatter;
  courseMarkdown: string;
  introductionHtml: string;
  lessons: ParsedLesson[];
}

function rewriteLocalReferences(
  html: string,
  root: string,
  sourceFile: string,
  lessons: Map<string, string>,
): string {
  return html.replace(
    /\b(href|src)="([^"]+)"/g,
    (match, attribute: string, reference: string) => {
      if (/^(?:https?:|mailto:|data:|blob:|#)/.test(reference)) return match;
      try {
        const target = resolveCoursePath(root, sourceFile, reference);
        const lessonId = lessons.get(target);
        if (attribute === "href" && lessonId) return `href="#/${lessonId}"`;
        return `${attribute}="course-files/${path.relative(root, target).split(path.sep).join("/")}"`;
      } catch {
        return match;
      }
    },
  );
}

export async function loadCourse(coursePath: string): Promise<LoadedCourse> {
  const root = path.resolve(coursePath);
  const courseFile = path.join(root, "COURSE.md");
  const courseMarkdown = await fs.readFile(courseFile, "utf8");
  const frontmatter = courseFrontmatterSchema.parse(matter(courseMarkdown).data);
  const lessonReferences = lessonLinksFromCourse(courseMarkdown);
  if (lessonReferences.length === 0)
    throw new Error(`${courseFile}: No ordered lesson links found.`);
  const lessons = await Promise.all(
    lessonReferences.map(async (reference) => {
      const file = resolveCoursePath(root, courseFile, reference);
      return parseLesson(file, await fs.readFile(file, "utf8"));
    }),
  );
  const lessonIds = new Map(
    lessons.map((lesson) => [path.resolve(lesson.file), lesson.frontmatter.id]),
  );
  const rewrittenLessons = lessons.map((lesson) => ({
    ...lesson,
    html: rewriteLocalReferences(lesson.html, root, lesson.file, lessonIds),
  }));
  const introduction = (
    await renderMarkdown(courseMarkdown, courseFile, frontmatter.id)
  ).html;
  const introductionHtml = rewriteLocalReferences(
    introduction,
    root,
    courseFile,
    lessonIds,
  );
  return {
    root,
    frontmatter,
    courseMarkdown,
    introductionHtml,
    lessons: rewrittenLessons,
  };
}

export async function compileRuntimeCourse(coursePath: string): Promise<RuntimeCourse> {
  const loaded = await loadCourse(coursePath);
  const lessons = await Promise.all(
    loaded.lessons.map(async (lesson) => {
      const explorables: RuntimeExplorable[] = await Promise.all(
        lesson.explorables.map(async (explorable) => {
          const entry = resolveCoursePath(
            loaded.root,
            lesson.file,
            explorable.attributes.src,
          );
          let config: unknown = null;
          if (explorable.attributes.config) {
            const configPath = resolveCoursePath(
              loaded.root,
              lesson.file,
              explorable.attributes.config,
            );
            config = JSON.parse(await fs.readFile(configPath, "utf8"));
          }
          const sandboxHtml = await bundleExplorable({
            courseRoot: loaded.root,
            entry,
            instanceId: explorable.instanceId,
            lessonId: lesson.frontmatter.id,
            config: config as never,
          });
          return { ...explorable, sandboxHtml };
        }),
      );
      return { ...lesson, explorables };
    }),
  );
  return {
    root: loaded.root,
    frontmatter: loaded.frontmatter,
    introductionHtml: loaded.introductionHtml,
    lessons,
  };
}

async function validateParsedCourse(loaded: LoadedCourse): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const ids = new Map<string, string>();

  for (const lesson of loaded.lessons) {
    const previous = ids.get(lesson.frontmatter.id);
    if (previous) {
      diagnostics.push(
        diagnostic(
          lesson.file,
          "duplicate-lesson-id",
          `Lesson id "${lesson.frontmatter.id}" is also used by ${previous}.`,
        ),
      );
    }
    ids.set(lesson.frontmatter.id, lesson.file);

    const checkpointIds = new Set<string>();
    const explorableIds = new Set(
      lesson.explorables.map((explorable) => explorable.instanceId),
    );
    if (
      loaded.frontmatter.guidance &&
      (lesson.frontmatter.checkpoints?.length ?? 0) === 0
    ) {
      diagnostics.push(
        diagnostic(
          lesson.file,
          "missing-guided-checkpoints",
          "A guided course lesson must declare at least one checkpoint.",
        ),
      );
    }
    for (const checkpoint of lesson.frontmatter.checkpoints ?? []) {
      if (checkpointIds.has(checkpoint.id)) {
        diagnostics.push(
          diagnostic(
            lesson.file,
            "duplicate-checkpoint-id",
            `Checkpoint id "${checkpoint.id}" is repeated in this lesson.`,
          ),
        );
      }
      checkpointIds.add(checkpoint.id);
      if (
        checkpoint.completion === "explorable-event" &&
        !explorableIds.has(checkpoint.instanceId)
      ) {
        diagnostics.push(
          diagnostic(
            lesson.file,
            "unknown-checkpoint-explorable",
            `Checkpoint "${checkpoint.id}" references missing explorable instance "${checkpoint.instanceId}".`,
          ),
        );
      }
    }

    for (const explorable of lesson.explorables) {
      if (!explorable.fallbackHtml.trim()) {
        diagnostics.push(
          diagnostic(
            lesson.file,
            "missing-text-alternative",
            "Explorable directive needs a useful text alternative in its body.",
            explorable.position.line,
            explorable.position.column,
          ),
        );
      }
      for (const reference of [
        explorable.attributes.src,
        explorable.attributes.config,
      ].filter((value): value is string => Boolean(value))) {
        try {
          const target = resolveCoursePath(loaded.root, lesson.file, reference);
          if (!(await exists(target))) {
            diagnostics.push(
              diagnostic(
                lesson.file,
                "missing-explorable-file",
                `Referenced explorable file does not exist: ${reference}`,
                explorable.position.line,
                explorable.position.column,
              ),
            );
          }
        } catch (error) {
          diagnostics.push(
            diagnostic(
              lesson.file,
              "unsafe-path",
              messageFor(error),
              explorable.position.line,
              explorable.position.column,
            ),
          );
        }
      }
    }

    for (const exercise of lesson.exercises) {
      try {
        const directory = resolveCoursePath(
          loaded.root,
          lesson.file,
          exercise.attributes.path,
        );
        const manifestFile = path.join(directory, "exercise.json");
        if (!(await exists(directory))) {
          diagnostics.push(
            diagnostic(
              lesson.file,
              "missing-exercise",
              `Exercise directory does not exist: ${exercise.attributes.path}`,
              exercise.position.line,
              exercise.position.column,
            ),
          );
        } else if (!(await exists(manifestFile))) {
          diagnostics.push(
            diagnostic(
              manifestFile,
              "missing-exercise-manifest",
              "Missing exercise.json.",
            ),
          );
        } else {
          exerciseManifestSchema.parse(
            JSON.parse(await fs.readFile(manifestFile, "utf8")),
          );
        }
      } catch (error) {
        diagnostics.push(
          diagnostic(
            lesson.file,
            "invalid-exercise",
            messageFor(error),
            exercise.position.line,
            exercise.position.column,
          ),
        );
      }
    }

    for (const link of lesson.links) {
      if (/^(?:https?:|mailto:|#)/.test(link.href)) continue;
      try {
        const target = resolveCoursePath(loaded.root, lesson.file, link.href);
        if (!(await exists(target))) {
          diagnostics.push(
            diagnostic(
              lesson.file,
              "broken-link",
              `Relative link does not resolve: ${link.href}`,
              link.position.line,
              link.position.column,
            ),
          );
        }
      } catch (error) {
        diagnostics.push(
          diagnostic(
            lesson.file,
            "unsafe-link",
            messageFor(error),
            link.position.line,
            link.position.column,
          ),
        );
      }
    }
  }
  return diagnostics;
}

async function validateAgentPlugin(
  root: string,
  course: CourseFrontmatter,
): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const manifestFile = path.join(root, "plugin.json");

  try {
    if (!(await isContained(root, manifestFile))) {
      throw new Error("plugin.json resolves outside the Agent Plugin root.");
    }
    const manifest = agentPluginManifestSchema.parse(
      JSON.parse(await fs.readFile(manifestFile, "utf8")),
    );
    if (manifest.name !== course.id) {
      diagnostics.push(
        diagnostic(
          manifestFile,
          "plugin-name-mismatch",
          `Agent Plugin name "${manifest.name}" must match course id "${course.id}".`,
        ),
      );
    }
    if (manifest.version !== course.version) {
      diagnostics.push(
        diagnostic(
          manifestFile,
          "plugin-version-mismatch",
          `Agent Plugin version "${manifest.version ?? "(missing)"}" must match course version "${course.version}".`,
        ),
      );
    }
  } catch (error) {
    diagnostics.push(
      diagnostic(manifestFile, "invalid-plugin-manifest", messageFor(error)),
    );
  }

  const skillsRoot = path.join(root, "skills");
  let entries: Dirent<string>[];
  try {
    if (!(await isContained(root, skillsRoot))) {
      throw new Error("skills resolves outside the Agent Plugin root.");
    }
    entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  } catch (error) {
    diagnostics.push(
      diagnostic(skillsRoot, "invalid-plugin-skills", messageFor(error)),
    );
    return diagnostics;
  }

  for (const entry of entries) {
    const skillDirectory = path.join(skillsRoot, entry.name);
    const skillFile = path.join(skillDirectory, "SKILL.md");
    try {
      if (
        !(await fs.stat(skillDirectory)).isDirectory() ||
        !(await exists(skillFile))
      ) {
        continue;
      }
      if (!(await isContained(root, skillFile))) {
        throw new Error(
          `Skill "${entry.name}" resolves outside the Agent Plugin root.`,
        );
      }
      if (!(await fs.stat(skillFile)).isFile()) {
        throw new Error(
          `Skill "${entry.name}" does not contain a regular SKILL.md file.`,
        );
      }
      const skill = matter(await fs.readFile(skillFile, "utf8"));
      const frontmatter = agentSkillFrontmatterSchema.parse(skill.data);
      if (frontmatter.name !== entry.name) {
        diagnostics.push(
          diagnostic(
            skillFile,
            "skill-name-mismatch",
            `Agent Skill name "${frontmatter.name}" must match directory "${entry.name}".`,
          ),
        );
      }
      if (!skill.content.trim()) {
        diagnostics.push(
          diagnostic(
            skillFile,
            "empty-agent-skill",
            "Agent Skill instructions must not be empty.",
          ),
        );
      }
      if (entry.name === "start-course" && !skill.content.includes("../../AGENTS.md")) {
        diagnostics.push(
          diagnostic(
            skillFile,
            "missing-canonical-policy-reference",
            "The start-course skill must delegate to ../../AGENTS.md.",
          ),
        );
      }
    } catch (error) {
      diagnostics.push(diagnostic(skillFile, "invalid-agent-skill", messageFor(error)));
    }
  }

  return diagnostics;
}

export async function validateCourse(coursePath: string): Promise<Diagnostic[]> {
  const root = path.resolve(coursePath);
  const diagnostics: Diagnostic[] = [];
  for (const file of requiredFiles) {
    if (!(await exists(path.join(root, file)))) {
      diagnostics.push(
        diagnostic(
          path.join(root, file),
          "missing-required-file",
          `Missing required file: ${file}`,
        ),
      );
    }
  }
  if (!(await exists(path.join(root, "pnpm-lock.yaml")))) {
    const workspaceLock = path.resolve(root, "..", "..", "pnpm-lock.yaml");
    if (!(await exists(workspaceLock))) {
      diagnostics.push(
        diagnostic(
          path.join(root, "pnpm-lock.yaml"),
          "missing-lockfile",
          "Missing pnpm-lock.yaml.",
        ),
      );
    }
  }
  if (diagnostics.some((item) => item.severity === "error")) return diagnostics;

  let loaded: LoadedCourse;
  try {
    loaded = await loadCourse(root);
  } catch (error) {
    diagnostics.push(
      diagnostic(path.join(root, "COURSE.md"), "invalid-course", messageFor(error)),
    );
    return diagnostics;
  }
  diagnostics.push(...(await validateParsedCourse(loaded)));
  diagnostics.push(...(await validateAgentPlugin(root, loaded.frontmatter)));
  if (diagnostics.some((item) => item.severity === "error")) return diagnostics;

  try {
    await compileRuntimeCourse(root);
  } catch (error) {
    diagnostics.push(
      diagnostic(
        path.join(root, "COURSE.md"),
        "explorable-compilation",
        messageFor(error),
      ),
    );
  }
  return diagnostics;
}

export function formatDiagnostic(item: Diagnostic, root = process.cwd()): string {
  const file = path.relative(root, item.file) || path.basename(item.file);
  return `${file}:${item.line}:${item.column} [${item.severity}] ${item.code}: ${item.message}`;
}
