import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "examples/**/*.test.ts"],
    exclude: ["examples/**/exercises/**", "**/node_modules/**", "**/dist/**"],
    coverage: { reporter: ["text", "html"] },
  },
});
