import fs from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const output = path.resolve("dist/packages");
await fs.rm(output, { recursive: true, force: true });

await build({
  entryPoints: {
    "course-schema": "packages/course-schema/src/index.ts",
    markdown: "packages/markdown/src/index.ts",
    explorable: "packages/explorable-sdk/src/index.ts",
    "sandbox-server": "packages/sandbox/src/index.ts",
    validator: "packages/validator/src/index.ts",
    "create-course": "packages/create-course/src/index.ts",
    cli: "packages/cli/src/bin.ts",
  },
  outdir: output,
  bundle: true,
  packages: "external",
  platform: "node",
  format: "esm",
  target: "node24",
  sourcemap: true,
});

await build({
  entryPoints: {
    "sandbox-client": "packages/sandbox/src/client.ts",
    runtime: "packages/runtime/src/index.tsx",
  },
  outdir: output,
  bundle: true,
  packages: "external",
  platform: "browser",
  format: "esm",
  target: "es2022",
  sourcemap: true,
});

console.log(`Built package artifacts: ${output}`);
