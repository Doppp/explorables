# Codex Build Prompt: explorables MVP

You are the lead engineer responsible for implementing **explorables**, an open-source runtime and course format for interactive technical courses that run naturally alongside Codex and Claude Code Desktop.

The authoritative product specification is:

- `docs/PRD.md`

Read it fully before making architectural or implementation decisions. Treat it as the source of truth for product explorables, user experience, file formats, security constraints, and acceptance criteria.

## Repository authority and autonomous execution

You are authorised to create and maintain the public GitHub repository:

```text
git@github.com:Doppp/explorables.git
```

Use:

```text
owner: Doppp
repository: explorables
visibility: public
default branch: master
```

Before implementation:

1. Run `gh auth status`.
2. Check whether `Doppp/explorables` already exists.
3. If it does not exist:
   - initialise Git with `master` as the initial branch
   - create the public repository with GitHub CLI
   - configure `origin` as `git@github.com:Doppp/explorables.git`
   - push the initial specification commit
4. If it already exists:
   - inspect its history
   - use the existing repository
   - preserve all unrelated work
   - do not force-push
5. Verify the default branch is `master`; change it through supported GitHub mechanisms if permissions permit.
6. Commit and push coherent milestones to `master`.

Do not create a `main` branch. Do not force-push. Do not delete existing branches or repository content unless the PRD explicitly requires it and the content was created by this implementation effort.

Continue working autonomously until the complete definition of done is satisfied. Do not stop after planning, scaffolding, a partial runtime, or the first passing demo. Stop only when:

- all required functionality is implemented and verified, or
- a genuine external blocker requires user action, such as missing GitHub authentication, unavailable repository permissions, or DNS access.

When blocked, complete every task that does not depend on the blocker, document the exact remaining action, and resume automatically once it is resolved.

## Objective

Build a production-quality **v0.1 MVP** of explorables and the first six-lesson vertical slice of the reference course, **AI from First Principles**.

The completed repository must let a learner:

1. Clone the repository.
2. Install dependencies with pnpm.
3. Run one documented command.
4. Open the local course in the Codex built-in browser.
5. Navigate Markdown lessons.
6. Run interactive TypeScript explorables inside sandboxed iframes.
7. Move from a lesson to a real exercise directory.
8. Use Codex or Claude Code Desktop as the tutor through thin repository adapters.
9. Validate and test the course from a clean checkout.
10. Use the entire system without an account, backend, tracking service, or audio service.
11. Visit a basic static landing page built from the same repository.
12. Deploy that landing page to GitHub Pages for `explorables.ai`.

## Non-negotiable constraints

Follow these unless the PRD explicitly says otherwise:

- TypeScript 7.0
- Node.js 24 LTS
- pnpm 11
- Plain Markdown, not MDX
- React for the runtime shell only
- Vite for development and bundling
- `unified`, `remark`, and `rehype` for Markdown processing
- `remark-directive` for custom directives
- Zod for schemas and validation
- Biome for formatting and linting
- Vitest for unit tests
- Playwright for browser tests
- axe-core for accessibility checks
- No database
- No accounts or authentication
- No analytics or remote tracking
- No audio in v0.1
- No hosted execution
- No plugin marketplace
- No visual course editor
- The project and product name is `explorables`, styled in lowercase.
- The canonical public repository is `Doppp/explorables`.
- The default branch is `master`.
- The canonical SSH remote is `git@github.com:Doppp/explorables.git`.
- A basic static landing page lives in `apps/site`.
- The landing page is deployed with GitHub Actions to GitHub Pages.
- The intended custom domain is `explorables.ai`.
- No analytics, tracking, cookie banner, CMS, or site backend in v0.1.
- No arbitrary course-owned Vite configuration
- Only two custom Markdown directives in v0.1:
  - `explorable`
  - `exercise`
- `AGENTS.md` is the canonical host-neutral tutoring policy.
- Codex reads `AGENTS.md` directly.
- Claude Code Desktop uses `CLAUDE.md` plus `.claude/launch.json`.
- `CLAUDE.md` must remain a thin adapter to the canonical policy.
- Optional Codex or Claude skills are out of explorables unless necessary for the MVP.
- Community explorable code must not execute in the main course document context.
- Explorables must run in sandboxed iframes with a restrictive content security policy and no network access by default.

Do not silently replace these decisions with fashionable alternatives. When a dependency or version is genuinely incompatible, verify the issue using primary documentation, record it in `docs/decisions/`, and choose the smallest compatible adjustment.

## Working principles

- Build the smallest coherent system that satisfies the acceptance criteria.
- Prefer explicit code over unnecessary framework abstractions.
- Keep the course format readable without explorables.
- Keep course authoring simple.
- Do not build infrastructure for hypothetical future requirements.
- Maintain strict separation between:
  - course prose
  - executable explorable modules
  - programming exercises
  - runtime implementation
- Use tests to define public contracts.
- Treat accessibility and sandboxing as first-class requirements.
- Keep public APIs small and documented.
- Make sensible decisions without asking for routine confirmation.
- Ask only when a choice would materially change the product direction or contradict the PRD.

## Required repository architecture

Use the PRD as the detailed reference, with this target shape:

```text
explorables/
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
├── AGENTS.md
├── CLAUDE.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
├── biome.json
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── course-authoring.md
│   └── decisions/
├── packages/
│   ├── cli/
│   ├── course-schema/
│   ├── markdown/
│   ├── runtime/
│   ├── explorable-sdk/
│   ├── sandbox/
│   ├── validator/
│   └── create-course/
├── apps/
│   ├── site/
│   ├── dev-preview/
│   └── component-gallery/
├── templates/
│   └── basic-course/
├── examples/
│   ├── minimal-course/
│   └── ai-from-first-principles/
└── .github/
    └── workflows/
```

You may refine internal names if doing so materially improves clarity, but preserve the package boundaries and explain changes.

## Required CLI

Implement these commands:

```bash
explorables start [path]
explorables validate [path]
explorables test [path]
explorables build [path]
explorables new <name>
```

The root repository should also expose convenient pnpm commands for development, validation, testing, and building.

## Required host adapters

### Codex

- Use root `AGENTS.md` as the canonical repository instructions.
- Verify the local course can be started and opened in the Codex built-in browser.
- Do not depend on private Codex browser APIs.

### Claude Code Desktop

- Generate a thin root `CLAUDE.md` that imports or mirrors the canonical `AGENTS.md` policy.
- Add `.claude/launch.json` for starting the explorables preview.
- Verify the local course can be started and opened in Claude Code Desktop's Browser or Preview pane.
- If current Claude documentation requires a different launch schema, verify it from official Anthropic documentation and record the adjustment in an ADR.
- An optional `.claude/skills/start-course/SKILL.md` may be scaffolded only if it clearly improves the entry flow without becoming a core format requirement.

### Portability

The course format, runtime, lessons, explorables, and exercises must remain independent of either host.

## Required landing page

Build a basic production-ready static site under `apps/site`.

Required content:

- Hero explaining `explorables`
- How the browser/preview and coding-agent workspace work together
- The first course, *AI from First Principles*
- A short section explaining how authors create courses
- Links to the authoring guide and GitHub repository
- Open-source and licence information
- A no-tracking statement

Technical requirements:

- Use the existing React, TypeScript, and Vite stack.
- Do not introduce another site framework.
- Build to static files.
- Use responsive, accessible semantic HTML.
- Support light and dark system themes.
- Avoid stock images and decorative complexity.
- Add `apps/site/public/CNAME` containing `explorables.ai`.
- Add root scripts:
  - `pnpm site:dev`
  - `pnpm site:build`
  - `pnpm site:test`
- Add Playwright and axe checks appropriate to the site.

## Required GitHub Pages deployment

Add `.github/workflows/pages.yml`.

It must:

- Trigger on pushes to `master` and allow manual dispatch.
- Use the current official GitHub Pages Actions workflow.
- Install the pinned Node and pnpm versions.
- Use the committed lockfile.
- Run validation and relevant tests before deployment.
- Build `apps/site`.
- Upload and deploy the static artifact.
- Use least-privilege permissions and GitHub's Pages environment.

Configure the repository to use GitHub Actions as its Pages source when permissions permit.

Configure `explorables.ai` as the custom domain through repository settings or the GitHub API when permissions permit. A `CNAME` file alone is not sufficient. Do not guess or alter external DNS records without access. Instead, document the exact DNS changes required in `docs/deployment.md`.

## Required course format

A minimal course must work with:

```text
my-course/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── COURSE.md
├── package.json
├── pnpm-lock.yaml
└── lessons/
    └── 01-introduction.md
```

Implement and document:

- Course frontmatter
- Lesson frontmatter
- Ordered lessons from `COURSE.md`
- Relative Markdown links
- `explorable` directive
- `exercise` directive
- Clear source-file errors
- Static asset resolution
- Sanitised Markdown rendering

Do not introduce additional directives in v0.1.

## Required explorable contract

Implement a small framework-neutral TypeScript contract equivalent to the PRD's `ExplorableModule`, `ExplorableContext`, `ExplorableEvent`, and `ExplorableHandle`.

Requirements:

- Default export containing `mount`
- Optional `destroy`
- Optional `resize`
- Structured local event emission
- JSON-compatible configuration
- Test helpers for mounting modules
- No requirement that course authors use React
- First-party adapters may be added only when they reduce duplication

## Required sandbox

Explorables must:

- Be bundled by the explorables-controlled build pipeline
- Run in a sandboxed iframe
- Receive no network access by default
- Use a restrictive CSP
- Communicate with the host through a minimal `postMessage` protocol
- Fail independently without crashing the course shell
- Show useful development errors
- Clean up event listeners and iframe resources on unmount

Add explicit security tests where feasible.

## Required validator

Validate at least:

- Required files
- Course and lesson frontmatter
- Unique IDs
- Lesson links
- Referenced explorable source files
- Referenced exercise directories
- Directive attributes
- Explorable compilation
- Course licences
- Basic accessibility requirements
- Fresh-checkout buildability

Validation output must contain actionable file and line information.

## Required course template

`explorables new <name>` must scaffold a runnable example containing:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.claude/launch.json`
- `COURSE.md`
- One lesson
- One minimal explorable
- One exercise
- Relevant package configuration
- Validation and test commands

The generated project must pass its own validation and tests.

## Reference course vertical slice

Create `examples/ai-from-first-principles` with these six lessons:

1. Gradient descent
2. Backpropagation
3. BPE tokenisation
4. Self-attention
5. Sampling and generation
6. Evaluation leakage

Each lesson must include:

- Clear learning objectives
- A prediction prompt in ordinary Markdown
- One meaningful explorable
- One focused programming exercise
- One intentional failure or debugging case
- One explanation or transfer prompt
- A useful text fallback for the explorable

The lessons should be educationally credible, not placeholders. Keep them compact enough for an MVP while ensuring the interactions demonstrate the format's value.

### Suggested explorables

- Gradient descent: loss curve, parameter position, and learning-rate control
- Backpropagation: small computation graph with forward values and gradients
- BPE: pair counts and step-by-step token merges
- Self-attention: editable query/key values, score matrix, softmax, and causal mask
- Sampling: editable logits with temperature, top-k, and top-p
- Evaluation leakage: train/test task split with a deliberate leakage toggle

### Suggested exercises

Use TypeScript for small browser-adjacent exercises where appropriate. Where Python is more natural for AI work, include a minimal Python exercise with a clearly documented test command. The explorables runtime itself must remain TypeScript.

## Documentation deliverables

Create:

- `README.md`
  - What `explorables` is
  - Quick start
  - How learners run a course
  - How authors create one
- `docs/deployment.md`
  - GitHub repository setup
  - GitHub Pages workflow
  - `explorables.ai` custom-domain setup
  - Required DNS records and verification
- `docs/architecture.md`
  - System overview
  - Package responsibilities
  - Markdown pipeline
  - Sandbox model
  - Trust boundaries
- `docs/course-authoring.md`
  - Complete author workflow
  - Course structure
  - Markdown examples
  - Explorable API
  - Exercise format
  - Validation
  - Publishing through GitHub
- `CONTRIBUTING.md`
  - Local setup
  - Testing
  - Contribution categories
  - Course and explorable review expectations
- `SECURITY.md`
  - Threat model
  - Reporting process
  - Community-course trust levels
- An ADR for every material departure from `docs/PRD.md`

## Testing and quality bar

Before declaring the MVP complete:

- Run type checking.
- Run Biome.
- Run all unit tests.
- Run integration tests.
- Run Playwright tests.
- Run accessibility checks.
- Build all packages.
- Validate both example courses.
- Build and test the landing page.
- Validate the GitHub Pages workflow syntax and artifact path.
- Verify the repository remote is exactly `git@github.com:Doppp/explorables.git`.
- Verify the active and default branch is `master`.
- Push the completed work to the canonical repository.
- Scaffold a new course into a temporary directory and verify that it builds.
- Test from a clean checkout or clean temporary copy.
- Verify that an explorable exception does not crash the course shell.
- Verify that iframe sandbox restrictions are applied.
- Verify narrow desktop layouts suitable for the Codex built-in browser.

Do not state that something works unless you have run the relevant verification.

## Implementation process

### Phase 0 — Understand and plan

Before writing implementation code:

1. Read `docs/PRD.md` fully.
2. Inspect the repository.
3. Verify the installed Node, pnpm, and TypeScript versions.
4. Identify unclear or contradictory requirements.
5. Write:
   - `docs/implementation-plan.md`
   - `docs/deployment.md`
  - GitHub repository setup
  - GitHub Pages workflow
  - `explorables.ai` custom-domain setup
  - Required DNS records and verification
- `docs/architecture.md`
6. Break work into small milestones with acceptance checks.

Do not spend excessive time rewriting the PRD.

### Phase 1 — Repository, site, and foundation

Implement:

- Canonical GitHub repository and `master` branch
- Public landing page
- GitHub Pages workflow
- Deployment documentation

- Workspace
- Tooling
- Schemas
- Markdown parser
- Minimal runtime shell
- Minimal CLI
- Minimal course example

Exit condition: a static Markdown-only course runs locally.

### Phase 2 — Explorable system

Implement:

- Module contract
- explorables-controlled bundling
- iframe sandbox
- host/iframe protocol
- error handling
- test utilities
- one example explorable

Exit condition: an explorable is loaded from a lesson and can emit an event safely.

### Phase 3 — Exercises and validation

Implement:

- Exercise directive
- Exercise manifest
- Validator
- actionable errors
- scaffold command

Exit condition: a generated course validates and its exercise tests can be run.

### Phase 4 — Reference course

Implement all six lessons, explorables, and exercises.

Exit condition: the vertical slice is complete and usable.

### Phase 5 — Hardening and documentation

Complete:

- Security checks
- Accessibility
- browser tests
- contributor documentation
- authoring guide
- clean-checkout verification

## Progress reporting

Maintain `docs/implementation-status.md` with:

- Completed milestones
- Current work
- Decisions made
- Known limitations
- Exact verification commands and their latest results

Update it at meaningful milestones, not after every trivial edit.

## Definition of done

The task is complete only when:

- The v0.1 acceptance criteria in `docs/PRD.md` are met or explicitly documented as deferred.
- A learner can run the six-lesson course locally without a backend in either Codex or Claude Code Desktop.
- The public GitHub repository exists at `Doppp/explorables` with `master` as its default branch.
- The landing page builds and is deployed through GitHub Pages.
- The repository is configured for the `explorables.ai` custom domain, or the only remaining blocker is clearly documented external DNS work.
- A contributor can scaffold and validate a new course.
- All required tests and checks pass.
- Documentation is sufficient for another developer to add a seventh lesson and a new explorable without reading the runtime source.
- The final response summarises:
  - What was built
  - Important architectural decisions
  - Verification performed
  - Known limitations
  - Recommended next milestone

Begin by reading `docs/PRD.md`, verify GitHub access, create or attach the canonical repository, then create the implementation plan and proceed through every phase autonomously. Keep implementing, testing, committing, and pushing until the definition of done is satisfied.
