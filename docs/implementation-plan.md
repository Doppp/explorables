# v0.1 implementation plan

This plan turns the acceptance criteria in `docs/PRD.md` into six coherent,
independently verifiable milestones. Work proceeds in order and each milestone
is committed and pushed to `master` after its checks pass.

## Constraints carried through every milestone

- Local-first course folders; no accounts, database, analytics, backend, audio,
  hosted execution, catalogue service, or LMS features.
- Plain Markdown with only `explorable` and `exercise` directives.
- Node.js 24 LTS, pnpm 11, TypeScript 7, React/Vite, unified/remark/rehype,
  Zod, Biome, Vitest, Playwright, and axe-core.
- Course JavaScript runs only in sandboxed iframes with network access denied.
- `AGENTS.md` is canonical; `CLAUDE.md` and `.claude/launch.json` are thin
  adapters.
- The public site is a static Vite build deployed from `master` by GitHub Pages.

## Milestone 0 — repository and design record

Deliverables:

- Attach this workspace to `git@github.com:Doppp/explorables.git` without
  replacing its existing history.
- Verify public visibility, SSH access, and `master` as the default branch.
- Pin the required toolchain and record architecture/deployment decisions.
- Create `docs/implementation-status.md` and keep it current at later
  boundaries.

Checks: Git/GitHub preflight, version resolution from package registries, and
review of current official Claude Desktop, Node, pnpm, and GitHub Pages docs.

## Milestone 1 — workspace, Markdown-only runtime, and public site

Deliverables:

- pnpm workspace, shared TypeScript/Biome/Vitest/Playwright configuration.
- Course schemas and safe Markdown pipeline with ordered lesson discovery,
  relative links, static assets, and source positions.
- CLI `start`, `validate`, `test`, `build`, and `new` command surfaces.
- React course shell and local Vite preview for a Markdown-only minimal course.
- Responsive, accessible `apps/site` and `.github/workflows/pages.yml`.

Exit check: a clean install can validate, start, and build the Markdown-only
example; the site builds with its `CNAME` artifact and passes axe checks.

## Milestone 2 — explorable execution boundary

Deliverables:

- Framework-neutral explorable contract and DOM test helper.
- Runtime-controlled esbuild bundling, one bundle per instance.
- `sandbox="allow-scripts"` iframe, restrictive CSP, minimal typed
  `postMessage` protocol, structured local events, resize and teardown.
- Independent loading/error states and useful source diagnostics.

Exit check: an explorable mounts, emits an event, resizes, unmounts, and can
throw without crashing lesson navigation; CSP and iframe attributes are tested.

## Milestone 3 — exercises, validator, and scaffolding

Deliverables:

- Exercise manifest and visible repository-path launcher.
- Validator checks required files, schemas, IDs, links, directives, referenced
  sources/directories/config, licences, explorable compilation, and baseline
  accessibility.
- Actionable `file:line:column` diagnostics and non-zero CLI exits.
- `explorables new <name>` template with both host adapters, explorable,
  exercise, package configuration, validation, and tests.

Exit check: a temporary generated course installs, validates, tests, and builds.

## Milestone 4 — AI from First Principles vertical slice

Deliverables:

- Six ordered lessons: gradient descent, backpropagation, BPE tokenisation,
  self-attention, sampling/generation, and evaluation leakage.
- Each lesson has objectives, prediction, meaningful accessible explorable,
  focused TypeScript exercise, intentional failure/debugging case, explanation
  or transfer prompt, and useful text fallback.

Exit check: all lessons and modules validate/build; all exercise tests and
model-unit tests pass; every lesson is reachable in runtime navigation.

## Milestone 5 — hardening, docs, deployment, and reproducibility

Deliverables:

- Browser tests for course/site at normal and narrow desktop widths, axe checks,
  sandbox/error-isolation checks, and static artifact checks.
- README, authoring guide, architecture, deployment, contributing, security,
  conduct, and licence documentation.
- GitHub Pages source set to Actions, custom domain set to `explorables.ai`, and
  the completed repository pushed to `master`.

Final verification:

1. Install using the committed lockfile under Node 24 and pnpm 11.
2. Run formatting/lint, typecheck, unit, integration, browser, accessibility,
   validator, all-package build, site build/test, and both example validations.
3. Scaffold and verify a course in a temporary directory.
4. Repeat the repository checks from a clean clone.
5. Confirm remote, active/default branch, Pages settings, workflow result, and
   deployed artifact/custom-domain state.

## External acceptance evidence

The codebase can make setup fast and can supply a feedback template, but the
PRD criterion requiring five target learners to complete two lessons needs
human participation. DNS records also require control of the external DNS
provider. These do not reduce the local implementation scope; exact outstanding
evidence or DNS actions are recorded in `docs/implementation-status.md`.
