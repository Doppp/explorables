# Course authoring guide

This guide is sufficient to add a seventh lesson or start a new course without
reading runtime source.

## 1. Define the promise

Write down the audience, prerequisites, observable outcomes, estimated time,
and explicit non-goals before building interactions. Use an explorable only
when direct manipulation improves a representation; use an exercise when the
learner must make the idea survive implementation and tests.

## 2. Scaffold and run

From this repository:

```bash
pnpm exec explorables new examples/my-course
pnpm install --frozen-lockfile
pnpm exec explorables start examples/my-course
```

The generated course contains both thin host adapters, one lesson, one
explorable, one exercise, and validation/test scripts.

## 3. Course structure

Required files are `README.md`, `AGENTS.md`, `CLAUDE.md`, `COURSE.md`,
`package.json`, and a pnpm lockfile (the monorepo examples use the root lock).
Recommended content directories are:

```text
lessons/       plain Markdown
explorables/   browser TypeScript modules
exercises/     explicit starter code and tests
assets/        local images and data
```

`COURSE.md` has YAML frontmatter followed by an ordinary numbered lesson list:

```md
---
id: systems-course
title: Systems Course
version: 0.1.0
summary: Inspect and implement one small system at a time.
license: CC-BY-4.0
---

## Lessons

1. [Queues](lessons/01-queues.md)
2. [Backpressure](lessons/02-backpressure.md)
```

Required fields are `id`, `title`, `version`, `summary`, and `license`. IDs use
lowercase kebab-case. Lesson `id` and `title` are required; `order`,
`objectives`, and `prerequisites` are optional.

## 4. Write a lesson

Lessons should remain useful on GitHub. A strong sequence is encounter,
predict, manipulate, inspect, explain, implement, debug, and transfer. Those
are headings and prose, not additional directives.

```md
---
id: queues
title: Queues
objectives:
  - predict queue growth under load
  - implement a bounded enqueue operation
---

# Queues

> Before running it, predict when the queue begins to grow.

:::explorable{src="../explorables/queue/index.ts" height="440" title="Queue simulator"}
Requests arrive on the left and leave at the configured service rate. When
arrival exceeds service, queue length increases until capacity is reached.
:::

:::exercise{path="../exercises/bounded-queue" command="pnpm test" title="Bound the queue"}
Implement the capacity check and run the supplied tests.
:::
```

Only `explorable` and `exercise` are supported. Unknown directives fail
validation. Relative Markdown links and assets resolve from the lesson file;
paths may not escape the course root. Raw HTML is sanitised.

### Explorable attributes

- `src` (required): relative TypeScript entry
- `height`: integer from 180 to 1200 pixels
- `title`: accessible iframe title
- `config`: relative JSON file
- `id`: stable kebab-case instance ID

The directive body is the required text alternative. Describe what the learner
can observe, not merely “interactive demo here.”

### Exercise attributes

- `path` (required): relative exercise directory
- `command`: learner test command override
- `title`: visible exercise name

Opening a lesson never runs this command.

## 5. Build an explorable

The module default export implements one framework-neutral method:

```ts
import type { ExplorableModule } from "@explorables/explorable";

const module: ExplorableModule = {
  mount(root, context) {
    const button = document.createElement("button");
    button.textContent = "Take a step";
    const onClick = () => context.emit({ type: "simulation-completed" });
    button.addEventListener("click", onClick);
    root.append(button);
    return {
      destroy() {
        button.removeEventListener("click", onClick);
        root.replaceChildren();
      },
      resize(width, height) {
        // Optional response to host layout changes.
      },
    };
  },
};

export default module;
```

`context` supplies `instanceId`, `lessonId`, JSON-compatible `config`, and a
local `emit` function. Events are never analytics. Keep mathematical/model code
separate and unit-test it. `mountForTest` in `@explorables/explorable` provides
a DOM smoke helper.

Every interaction must work with a keyboard, use labels/native controls where
practical, expose important updates through `aria-live`, avoid colour-only
meaning, respect reduced motion, and fit a narrow desktop pane.

The CLI bundles the entry. Course-owned Vite configuration, external runtime
CDNs, and browser network access are not allowed. Each artifact runs in an
opaque-origin iframe with scripts only and `connect-src 'none'`.

## 6. Add an exercise

```text
exercises/bounded-queue/
├── README.md
├── exercise.json
├── starter/
└── tests/
```

Example manifest:

```json
{
  "id": "bounded-enqueue",
  "title": "Implement bounded enqueue",
  "language": "typescript",
  "starter": "starter",
  "testCommand": "pnpm vitest run exercises/bounded-queue/tests",
  "estimatedMinutes": 25,
  "centralFiles": ["starter/queue.ts"],
  "protectedPaths": ["solution"]
}
```

Keep tasks focused and deterministic. Include an edge case or intentional
failure that makes the learner inspect the model. Official-course reference
solutions remain protected and are used only by CI to prove test validity.

## 7. Configure both hosts

Put launch and tutoring policy in `AGENTS.md`. It must prohibit solving central
starter files before an attempt and revealing protected paths. `CLAUDE.md`
should contain `@AGENTS.md` plus only Preview-specific guidance.
`.claude/launch.json` uses schema version `0.0.1`, runs `pnpm course`, and names
the preview port. Do not put lesson content in host adapters.

## 8. Validate and publish

```bash
pnpm exec explorables validate path/to/course
pnpm exec explorables test path/to/course
pnpm exec explorables build path/to/course
```

Validation checks schemas, IDs, links, directive attributes, source/config
files, exercise manifests, licences/text alternatives, and explorable
compilation. Diagnostics use `file:line:column`.

Before publishing, test keyboard use and narrow layout, inspect the text-only
fallback on GitHub, run from a clean checkout, declare licences for prose/code
and third-party assets, then tag an immutable release. External compatible
courses are unreviewed unless explicitly accepted by a catalogue review.
