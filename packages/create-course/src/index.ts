import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function courseId(name: string): string {
  return path
    .basename(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function replaceTokens(
  directory: string,
  values: Record<string, string>,
): Promise<void> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return replaceTokens(target, values);
      if (entry.isSymbolicLink()) return;
      const current = await fs.readFile(target, "utf8");
      const next = Object.entries(values).reduce(
        (text, [token, value]) => text.replaceAll(`{{${token}}}`, value),
        current,
      );
      if (next !== current) await fs.writeFile(target, next);
    }),
  );
}

export async function scaffoldCourse(name: string): Promise<void> {
  const id = courseId(name);
  if (!id) throw new Error("Course name must contain a letter or number.");
  const target = path.resolve(name);
  try {
    const entries = await fs.readdir(target);
    if (entries.length > 0) throw new Error(`Target directory is not empty: ${target}`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
  const template = path.resolve(packageDirectory, "../../../templates/basic-course");
  await fs.mkdir(target, { recursive: true });
  await fs.cp(template, target, {
    recursive: true,
    errorOnExist: true,
    filter: (source) =>
      !source.split(path.sep).includes("node_modules") &&
      !source.split(path.sep).includes("dist"),
  });
  await replaceTokens(target, {
    COURSE_ID: id,
    COURSE_NAME: path.basename(name).replace(/[-_]+/g, " "),
  });
  console.log(`Created course: ${target}`);
  console.log(`Next: cd ${name} && pnpm install && pnpm course`);
}
