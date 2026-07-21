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

## Hosts

Codex reads the canonical `AGENTS.md`. Claude Code Desktop reads a thin
`CLAUDE.md` adapter and the officially supported `.claude/launch.json` preview
configuration. Both start `pnpm course`, open localhost, read the same files,
and run the same tests. No runtime package calls private host APIs.

## Deployment

The local course runtime is never deployed. Only `apps/site/dist` is uploaded
as a static GitHub Pages artifact. The Pages workflow has read-only repository
contents during build; only its deploy job receives `pages: write` and
`id-token: write`.
