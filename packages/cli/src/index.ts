import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compileRuntimeCourse,
  formatDiagnostic,
  loadCourseCollection,
  validateCourse,
  validateCourseCollection,
} from "@explorables/validator";
import { createServer, type Plugin, build as viteBuild } from "vite";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDirectory, "../../..");
const previewRoot = path.join(repositoryRoot, "apps/dev-preview");

async function pathExists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function isCollection(root: string): Promise<boolean> {
  return pathExists(path.join(root, "explorables.library.json"));
}

function decodeUrlComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

async function safeCourseFile(
  coursePath: string,
  reference: string,
): Promise<string | null> {
  const requested = path.resolve(coursePath, decodeURIComponent(reference));
  const relative = path.relative(coursePath, requested);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  const [realCoursePath, realRequested] = await Promise.all([
    fs.realpath(coursePath),
    fs.realpath(requested),
  ]);
  const realRelative = path.relative(realCoursePath, realRequested);
  if (
    realRelative.startsWith("..") ||
    path.isAbsolute(realRelative) ||
    realRelative === ".."
  )
    return null;
  return realRequested;
}

async function sendCourseFile(
  coursePath: string,
  reference: string,
  response: import("node:http").ServerResponse,
): Promise<void> {
  let requested: string | null;
  try {
    requested = await safeCourseFile(coursePath, reference);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
    return;
  }
  if (!requested) {
    response.statusCode = 403;
    response.end("Forbidden");
    return;
  }
  try {
    const content = await fs.readFile(requested);
    response.setHeader(
      "Content-Type",
      requested.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream",
    );
    response.end(content);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
}

function coursePlugin(coursePath: string): Plugin {
  let compiled: Awaited<ReturnType<typeof compileRuntimeCourse>> | undefined;
  return {
    name: "explorables-course",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split("?")[0] ?? "";
        if (pathname.startsWith("/course-files/")) {
          await sendCourseFile(
            coursePath,
            pathname.slice("/course-files/".length),
            response,
          );
          return;
        }
        if (pathname !== "/course.json") return next();
        try {
          compiled ??= await compileRuntimeCourse(coursePath);
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(JSON.stringify(compiled));
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      });
    },
  };
}

function collectionPlugin(
  collection: Awaited<ReturnType<typeof loadCourseCollection>>,
): Plugin {
  const compiled = new Map<string, Awaited<ReturnType<typeof compileRuntimeCourse>>>();
  return {
    name: "explorables-course-collection",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split("?")[0] ?? "";
        if (pathname === "/explorables-library.json") {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(JSON.stringify(collection.runtime));
          return;
        }

        const courseMatch = pathname.match(/^\/courses\/([^/]+)\/course\.json$/);
        if (courseMatch?.[1]) {
          const courseId = decodeUrlComponent(courseMatch[1]);
          if (!courseId) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: "Invalid course id" }));
            return;
          }
          const coursePath = collection.coursePaths.get(courseId);
          if (!coursePath) {
            response.statusCode = 404;
            response.end(JSON.stringify({ error: "Course not found" }));
            return;
          }
          try {
            let course = compiled.get(courseId);
            if (!course) {
              course = await compileRuntimeCourse(coursePath, {
                assetBase: `courses/${encodeURIComponent(courseId)}/course-files`,
                lessonHashPrefix: `courses/${encodeURIComponent(courseId)}/lessons/`,
              });
              compiled.set(courseId, course);
            }
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.setHeader("Cache-Control", "no-store");
            response.end(JSON.stringify(course));
          } catch (error) {
            response.statusCode = 500;
            response.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          }
          return;
        }

        const assetMatch = pathname.match(/^\/courses\/([^/]+)\/course-files\/(.+)$/);
        if (assetMatch?.[1] && assetMatch[2]) {
          const courseId = decodeUrlComponent(assetMatch[1]);
          const coursePath = courseId ? collection.coursePaths.get(courseId) : null;
          if (!coursePath) {
            response.statusCode = 404;
            response.end("Not found");
            return;
          }
          await sendCourseFile(coursePath, assetMatch[2], response);
          return;
        }
        next();
      });
    },
  };
}

export async function validate(coursePath: string): Promise<boolean> {
  const root = path.resolve(coursePath);
  const collection = await isCollection(root);
  const diagnostics = collection
    ? await validateCourseCollection(root)
    : await validateCourse(root);
  if (diagnostics.length === 0) {
    console.log(`Valid ${collection ? "course collection" : "course"}: ${root}`);
    return true;
  }
  for (const item of diagnostics) console.error(formatDiagnostic(item, root));
  return !diagnostics.some((item) => item.severity === "error");
}

export async function startCourse(coursePath: string, port = 4173): Promise<void> {
  const root = path.resolve(coursePath);
  if (!(await validate(root))) throw new Error("Course validation failed.");
  const collection = await isCollection(root);
  const server = await createServer({
    root: previewRoot,
    plugins: [
      collection
        ? collectionPlugin(await loadCourseCollection(root))
        : coursePlugin(root),
    ],
    server: { host: "127.0.0.1", port, strictPort: true },
  });
  try {
    await server.listen();
  } catch (error) {
    await server.close();
    throw new Error(
      `Could not start explorables on port ${port}. Stop the process using that port, or explicitly choose another with --port <port>. A different port has separate browser progress.`,
      { cause: error },
    );
  }
  server.printUrls();
}

export async function buildCourse(
  coursePath: string,
  output?: string,
): Promise<string> {
  const root = path.resolve(coursePath);
  if (!(await validate(root))) throw new Error("Course validation failed.");
  const collection = await isCollection(root);
  const outDir = path.resolve(output ?? path.join(root, "dist"));
  await viteBuild({
    root: previewRoot,
    base: "./",
    build: { outDir, emptyOutDir: true },
  });
  if (collection) {
    const loaded = await loadCourseCollection(root);
    await fs.writeFile(
      path.join(outDir, "explorables-library.json"),
      `${JSON.stringify(loaded.runtime)}\n`,
    );
    for (const [courseId, availableCoursePath] of loaded.coursePaths) {
      const courseDirectory = path.join(outDir, "courses", courseId);
      await fs.mkdir(courseDirectory, { recursive: true });
      const course = await compileRuntimeCourse(availableCoursePath, {
        assetBase: `courses/${encodeURIComponent(courseId)}/course-files`,
        lessonHashPrefix: `courses/${encodeURIComponent(courseId)}/lessons/`,
      });
      await fs.writeFile(
        path.join(courseDirectory, "course.json"),
        `${JSON.stringify(course)}\n`,
      );
      const assets = path.join(availableCoursePath, "assets");
      if (await pathExists(assets))
        await fs.cp(assets, path.join(courseDirectory, "course-files/assets"), {
          recursive: true,
        });
    }
  } else {
    const course = await compileRuntimeCourse(root);
    await fs.writeFile(path.join(outDir, "course.json"), `${JSON.stringify(course)}\n`);
    const assets = path.join(root, "assets");
    if (await pathExists(assets))
      await fs.cp(assets, path.join(outDir, "course-files/assets"), {
        recursive: true,
      });
  }
  console.log(`Built ${collection ? "course collection" : "course"}: ${outDir}`);
  return outDir;
}

export async function testCourse(coursePath: string): Promise<void> {
  const root = path.resolve(coursePath);
  if (await isCollection(root)) {
    const collection = await loadCourseCollection(root);
    for (const availableCoursePath of collection.coursePaths.values())
      await testCourse(availableCoursePath);
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const child = spawn("pnpm", ["test"], {
      cwd: root,
      stdio: "inherit",
      shell: false,
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Tests exited ${code}`)),
    );
  });
}

export { scaffoldCourse } from "create-explorables-course";
