import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  compileRuntimeCourse,
  formatDiagnostic,
  validateCourse,
} from "@explorables/validator";
import { build as viteBuild, createServer, type Plugin } from "vite";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDirectory, "../../..");
const previewRoot = path.join(repositoryRoot, "apps/dev-preview");

function coursePlugin(coursePath: string): Plugin {
  let compiled: Awaited<ReturnType<typeof compileRuntimeCourse>> | undefined;
  return {
    name: "explorables-course",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split("?")[0] ?? "";
        if (pathname.startsWith("/course-files/")) {
          const requested = path.resolve(
            coursePath,
            decodeURIComponent(pathname.slice("/course-files/".length)),
          );
          const relative = path.relative(coursePath, requested);
          if (relative.startsWith("..") || path.isAbsolute(relative)) {
            response.statusCode = 403;
            return response.end("Forbidden");
          }
          try {
            const content = await fs.readFile(requested);
            response.setHeader(
              "Content-Type",
              requested.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream",
            );
            return response.end(content);
          } catch {
            response.statusCode = 404;
            return response.end("Not found");
          }
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

export async function validate(coursePath: string): Promise<boolean> {
  const root = path.resolve(coursePath);
  const diagnostics = await validateCourse(root);
  if (diagnostics.length === 0) {
    console.log(`Valid course: ${root}`);
    return true;
  }
  for (const item of diagnostics) console.error(formatDiagnostic(item, root));
  return !diagnostics.some((item) => item.severity === "error");
}

export async function startCourse(coursePath: string, port = 4173): Promise<void> {
  const root = path.resolve(coursePath);
  if (!(await validate(root))) throw new Error("Course validation failed.");
  const server = await createServer({
    root: previewRoot,
    plugins: [coursePlugin(root)],
    server: { host: "127.0.0.1", port, strictPort: false },
  });
  await server.listen();
  server.printUrls();
}

export async function buildCourse(
  coursePath: string,
  output?: string,
): Promise<string> {
  const root = path.resolve(coursePath);
  if (!(await validate(root))) throw new Error("Course validation failed.");
  const outDir = path.resolve(output ?? path.join(root, "dist"));
  await viteBuild({
    root: previewRoot,
    base: "./",
    build: { outDir, emptyOutDir: true },
  });
  const course = await compileRuntimeCourse(root);
  await fs.writeFile(path.join(outDir, "course.json"), `${JSON.stringify(course)}\n`);
  const assets = path.join(root, "assets");
  try {
    await fs.cp(assets, path.join(outDir, "course-files/assets"), { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  console.log(`Built course: ${outDir}`);
  return outDir;
}

export async function testCourse(coursePath: string): Promise<void> {
  const root = path.resolve(coursePath);
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
