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

The generated course is an Agent Plugins v1 package containing a portable
`start-course` skill, both thin legacy host adapters, one lesson, one
explorable, one exercise, and validation/test scripts.

## 3. Course structure

Required files are `README.md`, `AGENTS.md`, `CLAUDE.md`, `COURSE.md`,
`plugin.json`, `skills/start-course/SKILL.md`, `package.json`, and a pnpm
lockfile (the monorepo examples use the root lock).
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

### Optional guided course mode

Add `guidance` to `COURSE.md` to opt in:

```yaml
guidance:
  defaultMode: guided
  allowExploreMode: true
  allowSkipping: true
  persistLocally: true
```

Newly scaffolded courses include this Guided configuration and a four-step
prediction, interaction, implementation, and explanation checkpoint sequence.
Authors may remove `guidance` when unrestricted navigation is intentional; the
runtime still remembers the last visited lesson locally.

Courses without this object retain unrestricted navigation. Guided courses must
give every lesson at least one checkpoint. A learner checkpoint is an explicit
acknowledgment; an explorable checkpoint completes only after an exact event
from an exact stable explorable `id`:

```yaml
checkpoints:
  - id: predict
    title: Record your prediction
    completion: learner
  - id: experiment
    title: Run the queue experiment
    completion: explorable-event
    instanceId: queue-simulator
    event: simulation-completed
  - id: implement
    title: Attempt the exercise and run its tests
    completion: learner
  - id: explain
    title: Explain the result and one failure mode
    completion: learner
```

The matching directive must declare `id="queue-simulator"` and emit
`simulation-completed` only after a meaningful learner interaction. Never emit
the completion event during initial render. Use a learner checkpoint for
exercise work: the runtime deliberately does not run or grade exercises.

Local persistence is browser-profile-only and resettable. It is not suitable
for assessment evidence, identity, analytics, or cross-device progress.

### Optional discovery cycle

Set `discoveryCycle: true` in lesson frontmatter to apply the stricter profile
to one lesson while piloting it. Set `guidance.discoveryCycle: true` to require
it in every lesson. A discovery cycle uses ordered `predict`, `experiment`,
`apply`, and `reflect` phases. Prediction and reflection capture a bounded
browser-local response; the experiment records evidence rather than completing
from an incidental parameter change:

```yaml
discoveryCycle: true
checkpoints:
  - id: predict
    title: Predict the outcome
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: What do you expect, and why?
  - id: experiment
    title: Save an experiment
    phase: experiment
    completion: explorable-event
    instanceId: queue-simulator
    event: experiment-recorded
  - id: implement
    title: Apply the model in code
    phase: apply
    completion: learner
  - id: explain
    title: Explain the evidence and one failure mode
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: What evidence changed or confirmed your model?
```

Responses and experiment runs migrate with guided progress, are removed by the
same confirmed restart/reset rules, and never leave the browser. They are
learning artifacts, not grades or proof of understanding.

The runtime adds a course-session panel without requiring author markup. It
remembers the last visited lesson for locally persistent courses and identifies
the first incomplete checkpoint in Guided mode. The panel defines portable
learner phrases for start/resume, pause/end-session, review, Explore, confirmed
checkpoint restart, reset, and finish. Course tutor policies should use those
meanings and treat the browser state as authoritative.

Resume is scoped to the course ID/version, browser profile, and web origin.
Keep the default strict local port for normal use. A custom port intentionally
creates a separate progress scope. Course state never contains solutions or
assessment evidence, and storage failures must leave the course usable with a
visible non-persistence warning.

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
    const onClick = () =>
      context.recordExperiment({
        label: "one step",
        inputs: { queueLength: 3 },
        outputs: { queueLength: 4 },
      });
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

`context` supplies `instanceId`, `lessonId`, JSON-compatible `config`, a local
`emit` function, and `recordExperiment`. Experiment records accept bounded
scalar input/output fields so the parent can validate, store, and compare them.
The parent supplies record IDs and timestamps; the iframe never receives
storage access. Events and records are never analytics. Keep mathematical/model
code separate and unit-test it. `mountForTest` in
`@explorables/explorable` provides a DOM smoke helper.

For a discovery explorable, provide a baseline/reset, learner-created inputs,
visible assumptions and intermediate calculations, a meaningful broken case,
and a save-evidence action. Do not call `recordExperiment` during initial
render. The authoring review should be able to answer: what new question can a
learner investigate that the lesson did not prescribe exactly?

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

## 7. Configure the portable plugin and host adapters

Put launch and tutoring policy in `AGENTS.md`. It must prohibit solving central
starter files before an attempt and revealing protected paths. `CLAUDE.md`
should contain `@AGENTS.md` plus only Preview-specific guidance.
`.claude/launch.json` uses schema version `0.0.1`, runs `pnpm course`, and names
the preview port. Do not put lesson content in host adapters.

Keep `plugin.json` at the course root and target the canonical Agent Plugins v1
schema. Its `name` and `version` must match `COURSE.md`. Put portable startup
instructions in `skills/start-course/SKILL.md`; its `name` must match the
`start-course` directory, and it should read `../../AGENTS.md` rather than copy
the tutoring policy. MCP is optional in Agent Plugins v1 and is not needed for
an explorables course.

## 8. Validate and publish

```bash
pnpm exec explorables validate path/to/course
pnpm exec explorables test path/to/course
pnpm exec explorables build path/to/course
```

Validation checks the Agent Plugin manifest and discovered Agent Skills plus
course schemas, IDs, links, directive attributes, source/config files,
exercise manifests, licences/text alternatives, and explorable compilation.
Diagnostics use `file:line:column`.

Before publishing, test keyboard use and narrow layout, inspect the text-only
fallback on GitHub, run from a clean checkout, declare licences for prose/code
and third-party assets, then tag an immutable release. External compatible
courses are unreviewed unless explicitly accepted by a catalogue review.

## 9. Assemble a local course collection

A repository containing several independent course packages may add
`explorables.library.json` at its root. The manifest orders learning tracks and
explicitly allowlists available course directories:

```json
{
  "schemaVersion": 1,
  "title": "Systems learning path",
  "summary": "Start with foundations, then choose a specialization.",
  "tracks": [
    {
      "id": "foundations",
      "title": "Foundations",
      "summary": "Build the common baseline.",
      "courses": [
        { "status": "available", "path": "courses/foundations" },
        {
          "status": "planned",
          "id": "advanced-systems",
          "title": "Advanced Systems",
          "summary": "A future specialization."
        }
      ]
    }
  ]
}
```

Available paths must be relative, remain inside the collection root, and point
to independently valid courses. Their title, summary, version, lesson count,
duration, and tags come from `COURSE.md`. Planned entries are visibly disabled
and need enough metadata to explain the future course without implying it is
installed.

The normal commands recognize either kind of root:

```bash
pnpm exec explorables validate path/to/collection
pnpm exec explorables start path/to/collection
pnpm exec explorables build path/to/collection
```

Collections do not scan the filesystem, clone repositories, install
dependencies, or replace the plugin manifest and tutoring policy inside each
course.
