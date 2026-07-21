import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const exercises = readdirSync(new URL("../exercises", import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const exercise of exercises) {
  const args = [
    "exec",
    "vitest",
    "run",
    `exercises/${exercise}/tests`,
    "--config",
    "vitest.exercise.config.ts",
  ];
  const starter = spawnSync("pnpm", args, {
    env: { ...process.env, EXPLORABLES_SOLUTION: "0" },
    stdio: "ignore",
  });
  if (starter.status === 0)
    throw new Error(
      `${exercise}: starter unexpectedly passes; its intended failure is missing`,
    );
  const solution = spawnSync("pnpm", args, {
    env: { ...process.env, EXPLORABLES_SOLUTION: "1" },
    stdio: "inherit",
  });
  if (solution.status !== 0) throw new Error(`${exercise}: reference solution failed`);
  console.log(`verified exercise: ${exercise} (starter fails, reference passes)`);
}
