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
});
