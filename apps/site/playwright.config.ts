import { defineConfig } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4174" },
  webServer: {
    command: "pnpm site:dev --host 127.0.0.1 --port 4174",
    cwd: path.resolve(import.meta.dirname, "../.."),
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
  },
});
