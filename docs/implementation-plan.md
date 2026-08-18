# v0.1 implementation plan

This plan turns the acceptance criteria in `docs/PRD.md` into six coherent, independently verifiable milestones. Work proceeds in order and each milestone is committed and pushed to `master` after its checks pass.

## Constraints carried through every milestone

- Local-first course folders; no accounts, database, analytics, backend, audio, hosted execution, catalogue service, or LMS features.
- Plain Markdown with only `explorable` and `exercise` directives.
- Node.js 24 LTS and pnpm 11 by default, with Node.js 22.22.2+ and pnpm 10.26.0+ compatibility; TypeScript 7, React/Vite, unified/remark/rehype, Zod, Biome, Vitest, Playwright, and axe-core.
- Course JavaScript runs only in sandboxed iframes with network access denied.
- `AGENTS.md` is canonical; `CLAUDE.md` and `.claude/launch.json` are thin adapters.
- Course roots conform to Agent Plugins v1; `skills/start-course/SKILL.md` is a portable thin adapter to `AGENTS.md`.
- The public site is a static Vite build deployed from `master` by GitHub Pages.

## Milestone 0 — repository and design record

Deliverables:

- Attach this workspace to `git@github.com:Doppp/explorables.git` without replacing its existing history.
- Verify public visibility, SSH access, and `master` as the default branch.
- Pin the required toolchain and record architecture/deployment decisions.
- Create `docs/implementation-status.md` and keep it current at later boundaries.

Checks: Git/GitHub preflight, version resolution from package registries, and review of current official Claude Desktop, Node, pnpm, and GitHub Pages docs.

## Milestone 1 — workspace, Markdown-only runtime, and public site

Deliverables:

- pnpm workspace, shared TypeScript/Biome/Vitest/Playwright configuration.
- Course schemas and safe Markdown pipeline with ordered lesson discovery, relative links, static assets, and source positions.
- CLI `start`, `validate`, `test`, `build`, and `new` command surfaces.
- React course shell and local Vite preview for a Markdown-only minimal course.
- Responsive, accessible `apps/site` and `.github/workflows/pages.yml`.

Exit check: a clean install can validate, start, and build the Markdown-only example; the site builds with its `CNAME` artifact and passes axe checks.

## Milestone 2 — explorable execution boundary

Deliverables:

- Framework-neutral explorable contract and DOM test helper.
- Runtime-controlled esbuild bundling, one bundle per instance.
- `sandbox="allow-scripts"` iframe, restrictive CSP, minimal typed `postMessage` protocol, structured local events, resize and teardown.
- Independent loading/error states and useful source diagnostics.

Exit check: an explorable mounts, emits an event, resizes, unmounts, and can throw without crashing lesson navigation; CSP and iframe attributes are tested.

## Milestone 3 — exercises, validator, and scaffolding

Deliverables:

- Exercise manifest and visible repository-path launcher.
- Validator checks required files, schemas, IDs, links, directives, referenced sources/directories/config, licences, explorable compilation, and baseline accessibility.
- Actionable `file:line:column` diagnostics and non-zero CLI exits.
- `explorables new <name>` template with both host adapters, explorable, exercise, package configuration, validation, and tests.

Exit check: a temporary generated course installs, validates, tests, and builds.

## Milestone 4 — AI from First Principles vertical slice

Deliverables:

- Six ordered lessons: gradient descent, backpropagation, BPE tokenisation, self-attention, sampling/generation, and evaluation leakage.
- Each lesson has objectives, prediction, meaningful accessible explorable, focused TypeScript exercise, intentional failure/debugging case, explanation or transfer prompt, and useful text fallback.

Exit check: all lessons and modules validate/build; all exercise tests and model-unit tests pass; every lesson is reachable in runtime navigation.

## Milestone 5 — hardening, docs, deployment, and reproducibility

Deliverables:

- Browser tests for course/site at normal and narrow desktop widths, axe checks, sandbox/error-isolation checks, and static artifact checks.
- README, authoring guide, architecture, deployment, contributing, security, conduct, and licence documentation.
- GitHub Pages source set to Actions, custom domain set to `explorables.ai`, and the completed repository pushed to `master`.

Final verification:

1. Install using the committed lockfile under the default Node 24/pnpm 11 toolchain and the Node 22/pnpm 10 compatibility floor.
2. Run formatting/lint, typecheck, unit, integration, browser, accessibility, validator, all-package build, site build/test, and both example validations.
3. Scaffold and verify a course in a temporary directory.
4. Repeat the repository checks from a clean clone.
5. Confirm remote, active/default branch, Pages settings, workflow result, and deployed artifact/custom-domain state.

## External acceptance evidence

The codebase can make setup fast and can supply a feedback template, but the PRD criterion requiring five target learners to complete two lessons needs human participation. DNS records also require control of the external DNS provider. These do not reduce the local implementation scope; exact outstanding evidence or DNS actions are recorded in `docs/implementation-status.md`.

## Milestone 6 — guided course mode

Deliverables:

- Opt-in course and lesson schemas for guidance policy and checkpoints.
- Validated manual and explorable-event checkpoint completion.
- Ordered navigation with deep-link recovery, explicit skip and Explore mode, a local question parking lot, reset, and versioned browser-only resume state.
- `AI from First Principles` checkpoint metadata and tutor focus policy across all thirteen lessons.
- Backward compatibility for courses without guidance and no changes to iframe permissions or deliberate exercise execution.

Exit check: complete a guided learner path, verify lock/skip/Explore/reset and reload behavior, pass axe at normal and narrow widths, validate both example courses, and run the full repository build and test suite.

## Milestone 7 — portable Agent Plugin packaging

Deliverables:

- Root Agent Plugins v1 manifests for first-party courses and the course template.
- Portable `start-course` Agent Skills that delegate to canonical `AGENTS.md`.
- Manifest, identity/version, skill discovery, and Agent Skills validation.
- Updated scaffold, architecture, authoring documentation, and ADR.

Exit check: both example courses and a newly scaffolded course validate as Agent Plugins v1 packages, then pass the full repository check and build.

## Milestone 8 — local course library and case-study path

Deliverables:

- Optional validated `explorables.library.json` with ordered tracks, contained available-course paths, and honest planned-course metadata.
- Local and static collection routes with course-scoped data/assets, safe deep links, standalone-course compatibility, and isolated guided progress.
- Accessible normal/narrow library UI for the foundation, shared research core, and model-family specializations.
- Real-model connection sections across all thirteen foundation lessons while keeping release-specific reconstruction in separate planned courses.
- Updated PRD, architecture, roadmap, source register, status, and ADR.

Exit check: collection and standalone validation/build pass; browser tests cover selection, planned states, deep links, guidance, sandboxing, narrow layout, and axe; the full repository check and build pass under the default Node 24/pnpm 11 toolchain and the Node 22/pnpm 10 compatibility floor.

## Milestone 9 — supported toolchain compatibility

Deliverables:

- Keep Node.js 24 and pnpm 11 as the default development and deployment toolchain.
- Accept Node.js 22.22.2+ within the 22.x LTS line and pnpm 10.26.0+.
- Verify frozen installs, checks, and builds at both compatibility boundaries in GitHub Actions.
- Document the support window and dependency-derived minimum versions.

Exit check: the frozen lockfile installs and the full check/build suite passes under Node.js 22 with pnpm 10 and Node.js 24 with pnpm 11.

## Milestone 10 — course-session continuity

Deliverables:

- Framework-owned start/resume surface and shared lifecycle phrase vocabulary.
- Lesson-level local resume for every course and checkpoint-level resume, review, confirmed rollback, Explore, reset, and completion behavior for guided courses.
- Safe browser-storage handling, page-exit flush, visible persistence status, and a strict stable development origin.
- Matching portable skill, Codex, Claude, scaffold, authoring, architecture, PRD, changelog, and accessibility/browser coverage.

Exit check: pause and restart the local course across a server restart, resume the exact guided checkpoint and an unguided lesson, verify review/rollback and storage-failure behavior, then pass the full check, build, course, browser, and site suites.

## Milestone 11 — discovery learning records

Deliverables:

- Optional course- or lesson-level discovery cycles with ordered prediction, experiment, application, and reflection phases.
- Browser-local prediction/reflection responses and version-1 guided-state migration without accounts, grading, analytics, or cross-device state.
- A bounded `recordExperiment` SDK contract, parent-owned evidence journal, selectable baselines, and accessible run comparison without weakening the iframe boundary.
- Discovery-first pilots for gradient descent, self-attention, and evaluation leakage, plus a discovery-ready generated-course template.
- Authoring rubric, validator coverage, security/state tests, and a human playtest protocol before wider lesson rollout.

Exit check: complete all four phases in each pilot, reload and compare saved evidence, restart before the experiment and verify later work is removed, reject malformed records, validate a scaffolded discovery course, and pass the full check/build/browser/accessibility suite.
