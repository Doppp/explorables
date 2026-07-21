#!/usr/bin/env node
import process from "node:process";
import { Command } from "commander";
import {
  buildCourse,
  scaffoldCourse,
  startCourse,
  testCourse,
  validate,
} from "./index.ts";

const program = new Command()
  .name("explorables")
  .description("Run and validate local-first explorable courses")
  .version("0.1.0");

program
  .command("start")
  .argument("[path]", "course directory", ".")
  .option("-p, --port <port>", "local port", "4173")
  .action(async (coursePath, options) => startCourse(coursePath, Number(options.port)));

program
  .command("validate")
  .argument("[path]", "course directory", ".")
  .action(async (coursePath) => {
    if (!(await validate(coursePath))) process.exitCode = 1;
  });

program.command("test").argument("[path]", "course directory", ".").action(testCourse);

program
  .command("build")
  .argument("[path]", "course directory", ".")
  .option("-o, --output <path>", "output directory")
  .action(async (coursePath, options) => {
    await buildCourse(coursePath, options.output);
  });

program
  .command("new")
  .argument("<name>", "new course directory")
  .action(scaffoldCourse);

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
