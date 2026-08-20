import { defineConfig } from "@playwright/test";

const coursePort = process.env.EXPLORABLES_TEST_PORT ?? "4173";
const courseUrl = `http://127.0.0.1:${coursePort}`;

export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: true,
  use: {
    baseURL: courseUrl,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm course --port ${coursePort}`,
    url: courseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
