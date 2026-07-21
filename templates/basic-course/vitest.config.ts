import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["exercises/**/*.test.ts", "explorables/**/*.test.ts"],
  },
});
