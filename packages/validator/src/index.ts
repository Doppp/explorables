import fs from "node:fs/promises";
import path from "node:path";
import {
  courseFrontmatterSchema,
  exerciseManifestSchema,
  type CourseFrontmatter,
  type Diagnostic,
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
];

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
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
