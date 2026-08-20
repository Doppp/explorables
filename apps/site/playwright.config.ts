import path from "node:path";
import { defineConfig } from "@playwright/test";

const sitePort = process.env.EXPLORABLES_SITE_TEST_PORT ?? "4174";
const siteUrl = `http://127.0.0.1:${sitePort}`;

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: siteUrl },
  webServer: {
    command: `pnpm site:dev --host 127.0.0.1 --port ${sitePort}`,
    cwd: path.resolve(import.meta.dirname, "../.."),
    url: siteUrl,
    reuseExistingServer: !process.env.CI,
  },
});
