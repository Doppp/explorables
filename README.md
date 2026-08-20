# explorables

**See how it works. Build it yourself.**

`explorables` is an Agent Plugins v1-compatible open course format and local runtime for technical
learning through explanatory Markdown, sandboxed TypeScript interactions, real exercises, and a
coding-agent tutor. In tutor-led courses the coding agent is the primary adaptive teacher and the
browser is the explorable, evidence, and progress workbench; complete Markdown remains available as
the durable reference. A course is a normal folder. It needs no account, database, analytics,
hosted executor, or LMS.

The reference course is [AI from First Principles](examples/ai-from-first-principles). Its current
sixteen-lesson foundation begins by distinguishing generative AI, LLMs, and chatbot products,
steps through next-token generation and the learning loop, then builds from gradients and linear
layers through a trained tiny Transformer, cached autoregressive generation, sampling, and
claim-aligned evaluation.

The accepted [model-learning roadmap](docs/course-roadmap.md) continues through `Open Frontier Models: Shared Techniques`, then separate `Inside DeepSeek`, `Inside Kimi`, `Inside Qwen`, `Inside MiniMax`, and `Inside GLM` courses. Each model course uses pinned primary sources and a controlled reconstruction rather than treating one umbrella survey as a substitute for studying the lab.

## Start with Codex

The simplest learner experience uses **Codex in the ChatGPT desktop app**. Open Codex, start a local coding workspace, and paste this prompt:

```text
Install and launch explorables from https://github.com/Doppp/explorables.

Create a new `explorables` folder in my Documents folder. If that folder already exists, do not overwrite it; ask me what to do. Clone the repository using HTTPS, read its `AGENTS.md`, and follow its instructions. Check for Node.js 22.22.2 or newer in the 22.x line, or Node.js 24.15.0 or newer in the 24.x line, and pnpm 10.26.0+ (10.x) or pnpm 11, but ask before installing or changing system software. Install the locked dependencies with `pnpm install --frozen-lockfile`, run `pnpm course`, and open the printed local course library. Help me choose a course, then read that course's `AGENTS.md` and follow its tutoring policy. Ask me to predict, let me attempt exercises, run tests, and give the smallest useful hint before showing more.
```

Codex will ask for permission before running some commands or accessing a folder. Review and approve the actions needed to clone the public repository, install its dependencies, and start the local course. It should stop and ask instead of replacing an existing folder or installing missing system software.

The course interface, files, exercises, tests, and progress run locally. An internet connection is still needed for the Codex tutor, the initial repository download, and dependency installation. No separate API key, hosted course server, or explorables account is required.

## Manual quick start

Requirements: Node.js 22.22.2+ (22.x) or 24.15.0+ (24.x), and pnpm 10.26.0+ (10.x) or pnpm 11. Node.js 24 with pnpm 11 remains the default development and deployment toolchain.

```bash
git clone https://github.com/Doppp/explorables.git
cd explorables
pnpm install --frozen-lockfile
pnpm course
```

Open the printed `http://127.0.0.1:4173` URL in the Codex built-in browser, a normal browser, or Claude Code Desktop Preview. The local library shows the foundation, shared research-skills course, and planned model specializations. Select an available course, read its overview, then start or resume it. Codex should follow that course's `AGENTS.md` and tutor you through its active lesson. For example:

> Start AI from First Principles.

The course-session panel shows the saved lesson and, in Guided mode, the first incomplete checkpoint. Progress is stored only in the same browser profile, course version, and local address. Say **“Pause this course”** or **“End this session”** before stopping the local process, and **“Resume this course”** when you return. Reviewing preserves completion; checkpoint restarts and full resets require confirmation. If port `4173` is occupied, the CLI stops with guidance instead of silently changing the browser origin.

Agent Plugins-compatible clients discover the portable `start-course` skill. Codex can also read `AGENTS.md` directly, while Claude Code Desktop uses the thin `CLAUDE.md` adapter and `.claude/launch.json`; every path operates on the same host-neutral course files and tests.

## CLI

```bash
explorables start [path]
explorables validate [path]
explorables test [path]
explorables build [path]
explorables new <name>
```

`explorables start` uses the strict default address `127.0.0.1:4173` so local resume state remains available. `--port <port>` is supported explicitly, but a different port has separate browser storage.

From this source checkout, run the CLI as `pnpm exec explorables` or use the root scripts:

```bash
pnpm course:validate
pnpm course:test
pnpm course:build
pnpm test:browser
```

`explorables start <path>` automatically recognizes either a standalone course containing `COURSE.md` or a local collection containing `explorables.library.json`. Run `pnpm course:foundation` to bypass the library and open the reference course directly.

## Author a course

```bash
pnpm exec explorables new examples/my-course
pnpm install
pnpm --dir examples/my-course validate
```

A course is a self-contained Agent Plugin with root `plugin.json`, a portable `skills/start-course/SKILL.md`, `COURSE.md`, ordinary lesson Markdown, and only two custom directives: `explorable` and `exercise`. See the complete [course authoring guide](docs/course-authoring.md).

## Repository map

- `packages/`: schemas, Markdown, runtime, sandbox, validator, CLI, and scaffold
- `apps/site`: static landing page for `explorables.ai`
- `apps/dev-preview`: local course shell
- `examples/minimal-course`: smallest complete course
- `examples/ai-from-first-principles`: expanding reference course
- `templates/basic-course`: `explorables new` source
- `docs/architecture.md`: trust boundaries and package responsibilities

## Principles

- The repository is the course.
- Course prose teaches the durable concepts and remains readable as plain Markdown without a tutor.
- Course code never runs in the main document context.
- Agents tutor through prediction, manipulation, debugging, and explanation.
- Learners deliberately run exercises; opening a lesson never executes them.
- No learner activity leaves the machine.

## Licence and security

Repository code is MIT licensed. Reference course prose is CC-BY-4.0. See [SECURITY.md](SECURITY.md) before running external course code and [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.
