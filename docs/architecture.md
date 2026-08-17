# Architecture

`explorables` has four trust-separated layers: course source, compilation and
validation, the local course shell, and isolated explorable documents. The
repository is the distributable course and no server-side application state is
created.

```text
COURSE.md + lessons + modules + exercises
                  |
        schema / Markdown / validator
                  |
       local Vite server + React shell
                  |
       sandboxed iframe per explorable
```

## Package boundaries

- `@explorables/course-schema`: Zod schemas and shared data types. It knows no
  filesystem or UI details.
- `@explorables/markdown`: parses frontmatter and plain Markdown, recognizes
  only `explorable` and `exercise`, sanitises HTML, and preserves source
  positions for diagnostics.
- `@explorables/explorable`: the framework-neutral module/event/handle contract
  plus mount test helpers.
- `@explorables/sandbox`: controlled TypeScript bundling, iframe document/CSP,
  message validation, lifecycle, and cleanup.
- `@explorables/validator`: filesystem and cross-file checks that produce
  actionable diagnostics.
- `@explorables/runtime`: the React reading/navigation shell and directive UI.
- `@explorables/create-course`: copies the reviewed basic course template.
- `@explorables/cli`: commands and local Vite orchestration; it composes the
  other packages and does not define a second course format.

`apps/dev-preview` is the Vite entry used by `explorables start` and build.
`apps/site` is an independent static landing page. `apps/component-gallery`
documents first-party primitives without becoming an authoring system.

## Course loading and Markdown pipeline

1. Resolve a local course root and reject paths outside it.
2. Parse `COURSE.md` YAML with source positions and validate its frontmatter.
3. Derive lesson order from ordinary Markdown links under its `Lessons`
   section and load each linked file.
4. Parse lesson YAML and Markdown using unified, `remark-parse`,
   `remark-frontmatter`, `remark-directive`, `remark-rehype`, `rehype-sanitize`,
   and `rehype-stringify`.
5. Transform the two approved directives to typed runtime placeholders. Their
   fallback bodies remain visible until or when interaction is unavailable.
6. Rewrite safe relative links/assets through course-scoped server routes.

Raw HTML, event attributes, script URLs, and unknown directives are not passed
through. Source file and AST position follow every typed directive so build and
runtime errors identify the authoring location.

## Explorable compilation and sandbox

The CLI owns esbuild options. A course supplies an entry `.ts` module and JSON
configuration, never executable Vite configuration. The result is embedded in
an iframe `srcdoc` with `sandbox="allow-scripts"`; `allow-same-origin` is not
granted.

The iframe CSP defaults to no capabilities: `default-src 'none'` and
`connect-src 'none'`, with only inline/blob scripts and styles plus data/blob
images and data fonts needed for bundled modules. A bootstrap imports the
bundle, calls its default `mount`, catches failures, and exchanges only versioned
`ready`, `event`, `error`, `resize`, and `destroy` messages. Both sides validate
message shape and instance ID. Unmount removes listeners, invokes `destroy`,
revokes resources, and removes the iframe.

This protects the course document context and blocks browser networking. It
does not make installing an arbitrary dependency safe; external courses remain
unreviewed code and the CLI must display that trust boundary before any future
remote-install feature.

## Exercise boundary

Opening a lesson never runs an exercise. The `exercise` directive links to an
existing repository directory and shows its declared test command. Execution is
an explicit learner or host action. Tutor policy protects central and solution
paths; tests enforce outcomes without progress tracking.

## Guided course state

Guidance is an opt-in course-format feature. The schema describes course-level
mode policy and ordered lesson checkpoints. The validator rejects guided
lessons without checkpoints, duplicate checkpoint IDs, and event checkpoints
that reference an absent explorable instance.

The runtime reducer owns the active lesson, completed checkpoints, explicit
skips, mode, question parking lot, optional checkpoint responses, and bounded
experiment records. State is serialized under a
course/version/schema-scoped `localStorage` key when the course enables local
persistence. Parsing filters unknown lessons and checkpoints and resets stale
course versions. Courses without `guidance` keep unrestricted navigation.

Only an explicit learner action or an exact `(instanceId, event)` sandbox
message can complete a checkpoint. Sandboxed modules retain the same
permissions and cannot access the parent document's state. Exercises remain
deliberate learner or host actions; the runtime's learner acknowledgment is not
automated grading.

Discovery-cycle lessons add semantic checkpoint phases without adding Markdown
directives. `recordExperiment` wraps the existing local event channel with
bounded scalar inputs and outputs. The parent validates the payload, supplies
its ID and timestamp, retains at most twenty records per explorable, and renders
baseline/latest comparisons. The iframe cannot select storage keys, read prior
records, or bypass its opaque origin and `connect-src 'none'` boundary.

Guided-state schema v2 stores submitted responses, experiment runs, and selected
baselines. Parsing migrates valid schema-v1 progress. Confirmed restart removes
responses and evidence at or after the chosen checkpoint; reset removes both v2
and legacy keys. These artifacts are explicitly ungraded and local-only.

Every locally persistent course also writes a smaller, versioned session record
containing only its last visited lesson and update time. The runtime reads both
records defensively, resumes Guided courses from their reducer-owned active
lesson and first incomplete checkpoint, and resumes unguided courses from the
session lesson. It flushes both records on `pagehide` and reports unavailable
browser storage without blocking the lesson.

The visible session panel is the host-neutral continuity surface. The lesson
root also exposes read-only `data-explorables-*` attributes for course/version,
visible lesson, Guided position, checkpoint, mode, and persistence status.
Neither surface can complete a checkpoint. Review navigation leaves the Guided
position intact; a confirmed restart uses the reducer to delete the selected
checkpoint and all later progress. The local server uses a strict port so it
cannot silently move state to a different browser origin.

## Agent Plugin packaging and hosts

Each distributable course root is an Agent Plugins v1 package. Root
`plugin.json` declares portable identity and `skills/start-course/SKILL.md` is
the single portable component. The skill locates the course root, reads
`AGENTS.md` and `COURSE.md`, starts `pnpm course`, and then follows the active
lesson. No MCP server is needed because the existing CLI and local files supply
the workflow without another process or permission surface.

`AGENTS.md` remains the canonical host-neutral tutoring policy. Codex can read
it directly or activate the portable skill. Claude Code Desktop retains a thin
`CLAUDE.md` adapter and the officially supported `.claude/launch.json` preview
configuration. Both open localhost, read the same files, and run the same
tests. No runtime package calls private host APIs.

## Local course collections

A standalone course remains the unit of distribution and Agent Plugin
discovery. A repository may additionally contain `explorables.library.json` to
present an explicit local learning path across several course packages.

```text
explorables.library.json
        │ validate relative paths and course IDs
        ▼
local library index
        │ select an available course
        ▼
/courses/:courseId/course.json
/courses/:courseId/course-files/*
        │
        ▼
the same course runtime and iframe sandbox
```

The manifest is an allowlist, not a directory scan. Available entries derive
metadata from their contained `COURSE.md`; planned entries are
presentation-only and cannot be opened. Collection routing never grants a
course access outside its own root. The standalone `/course.json` and
`/course-files/*` contract is preserved.

See [ADR 0005](decisions/0005-local-course-library.md) for the curriculum and
distribution boundary.

## Deployment

The local course runtime is never deployed. Only `apps/site/dist` is uploaded
as a static GitHub Pages artifact. The Pages workflow has read-only repository
contents during build; only its deploy job receives `pages: write` and
`id-token: write`.
