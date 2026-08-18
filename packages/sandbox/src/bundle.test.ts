import { gzipSync } from "node:zlib";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bundleExplorable } from "./index.ts";

describe("sandbox bundle theme", () => {
  it("includes explicit light and dark tokens and handles theme messages", async () => {
    const packageRoot = fileURLToPath(new URL("..", import.meta.url));
    const entry = fileURLToPath(new URL("./theme-fixture.ts", import.meta.url));
    const html = await bundleExplorable({
      courseRoot: packageRoot,
      entry,
      instanceId: "themed",
      lessonId: "theme-test",
    });

    expect(html).toContain('<html lang="en" data-theme="light">');
    expect(html).toContain(':root[data-theme="light"]');
    expect(html).toContain(':root[data-theme="dark"]');
    expect(html).toContain("--canvas: #20262c");
    expect(html).toContain("--text: #f3f1ea");
    expect(html).toContain("document.documentElement.dataset.theme");
  });

  it("bundles a bounded Three.js scene without relaxing the sandbox", async () => {
    const packageRoot = fileURLToPath(new URL("..", import.meta.url));
    const entry = fileURLToPath(new URL("./three-fixture.ts", import.meta.url));
    const html = await bundleExplorable({
      courseRoot: packageRoot,
      entry,
      instanceId: "three-scene",
      lessonId: "renderer-spike",
    });

    expect(html).toContain("WebGLRenderer");
    expect(html).toContain("connect-src 'none'");
    expect(html).not.toContain("fetch(");
    expect(gzipSync(html).byteLength).toBeLessThan(250 * 1024);
  });

  it("keeps the complete first-party model catalogue offline and bounded", async () => {
    const courseRoot = fileURLToPath(
      new URL("../../../examples/ai-from-first-principles", import.meta.url),
    );
    const entry = fileURLToPath(
      new URL(
        "../../../examples/ai-from-first-principles/explorables/model-atlas/index.ts",
        import.meta.url,
      ),
    );
    const config = JSON.parse(
      await fs.readFile(
        new URL(
          "../../../examples/ai-from-first-principles/explorables/model-atlas/tiny-transformer.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const html = await bundleExplorable({
      courseRoot,
      entry,
      instanceId: "model-atlas",
      lessonId: "inference",
      config,
    });

    expect(html).toContain("GPT-4 disclosure boundary");
    expect(html).toContain("DeepSeek V4 family");
    expect(html).toContain("connect-src 'none'");
    expect(html).not.toContain("fetch(");
    expect(gzipSync(html).byteLength).toBeLessThan(350 * 1024);
  });
});
