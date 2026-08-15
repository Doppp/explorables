# Implementation status

Updated: 16 August 2026

## Completed

- Read the complete PRD and build assignment.
- Verified authenticated SSH GitHub access as `Doppp`.
- Verified `Doppp/explorables` is public and defaults to `master`.
- Attached the existing one-commit repository without rewriting history; pushed
  the specification as commit `abdf326`.
- Verified current official Claude Desktop `.claude/launch.json` schema.
- Verified TypeScript 7.0.2, pnpm 11.15.1, and Node 24 LTS are available.
- Recorded the implementation plan, architecture, and deployment procedure.
- Implemented the pinned pnpm workspace, public package contracts, all five CLI
  commands, safe Markdown pipeline, static assets, runtime shell, controlled
  explorable bundling, iframe CSP/protocol/cleanup, validator, and course
  template.
- Built the static accessible landing page and GitHub Pages workflow.
- Completed all six reference lessons, six distinct explorables, and six
  exercises with intentionally failing starters and passing protected
  references.
- Verified a freshly scaffolded course validates, tests, and builds.
- Added source-position diagnostics, error-isolation/security tests, axe checks,
  and normal/narrow browser checks.
- Accepted the model-learning path from `AI from First Principles` v0.2 through
  a shared `Open Frontier Models` core to separate DeepSeek, Kimi, Qwen,
  MiniMax, and GLM courses.
- Implemented the first v0.2 foundation milestone: shape-aware linear
  projections, stable cross-entropy, clipping, SGD, momentum, AdamW, two
  interactive lessons, and two protected exercises.
- Implemented the second v0.2 foundation increment: embedding lookup,
  RoPE-style positional rotation, causal multi-head attention, a pre-norm
  residual/SwiGLU block, next-token target alignment, four interactive lessons,
  and four protected exercises.
- Implemented the final v0.2 foundation increment: prefill and autoregressive
  decoding, equivalent cached and uncached attention, explicit cache memory and
  work accounting, and a deterministic tiny Transformer capstone with gradient
  checks, decreasing loss, generation, intermediate traces, and testable
  masking, shape, residual, and evaluation failures.
- Completed all thirteen `AI from First Principles` v0.2 lessons and connected
  the inference result to decoding policy and claim-aligned evaluation.
- Implemented reusable opt-in Guided Course Mode with ordered learner and
  explorable-event checkpoints, locked future navigation, deep-link recovery,
  explicit skipping, confirmed Explore mode, reset, a question parking lot,
  and versioned browser-only resume state.
- Applied four ordered checkpoints and focus-aware tutor policy to all thirteen
  `AI from First Principles` lessons without changing sandbox permissions or
  automatic exercise execution.
- Kept courses without guidance backward-compatible and added schema, reducer,
  validator, browser, accessibility, persistence, and recovery coverage.
- Refactored first-party courses and the course scaffold into Agent Plugins v1
  packages with root manifests and portable `start-course` Agent Skills.
- Added manifest, identity/version alignment, skill discovery/frontmatter, and
  canonical-policy delegation checks to course validation.
- Added an optional, explicit local course collection with ordered learning
  tracks, safe contained paths, planned-course cards, course-scoped routes and
  static artifacts, accessible selection, deep links, and standalone-course
  compatibility.
- Connected all thirteen foundation lessons to real-model mechanisms in
  ordinary Markdown while preserving shared research skills and pinned model
  reconstructions as separate courses.
- Reworked the local course library and lesson shell as a quiet, editorial
  learning interface with accessible pastel color roles, lesson-first hierarchy,
  explicit navigation states, compact course contents below 992px, and visually
  consistent sandbox controls. The course shell now reflows at 320px without
  putting the full lesson list ahead of the active lesson.
- Added an explicit, persistent light/dark theme control to the course library
  and lesson shell, including live theme synchronization into already-mounted
  sandboxed explorables. Retuned the dark pastel roles, restored the library
  hero and local-data notice to the full responsive content width, and corrected
  title casing while preserving the lowercase `explorables` wordmark.
- Retained Node.js 24/pnpm 11 as the default toolchain while adding an enforced,
  CI-tested compatibility floor of Node.js 22.22.2 and pnpm 10.26.0.

## Current work

The v0.1 runtime MVP remains verified. Course-session continuity now provides
a framework-owned resume surface, lesson-level local state for persistent
courses, Guided checkpoint resume and confirmed rollback, page-exit flushing,
storage-failure messaging, host-neutral state attributes, shared lifecycle
language, and a stable strict development origin.

`AI from First Principles`
`0.3.0-guided.1`, Guided Course Mode, Agent Plugins v1 packaging, and the local
course-library milestone are implemented. The course UI redesign and its
responsive/theme follow-up are complete.
The library presents the shared
frontier core and DeepSeek, Kimi, Qwen, MiniMax, and GLM specializations as
planned rather than runnable. The next implementation increment remains the
shared-core source freeze and its five research/comparison lessons, followed by
the pinned model-specific courses. External DNS and learner-study evidence also
remain.

## Decisions

- The installed global Node 26, pnpm 9, and TypeScript 5 are not used as the
  compatibility claim. TypeScript 7 remains pinned; Node.js 24/pnpm 11 is the
  default, and Node.js 22.22.2+/pnpm 10.26.0+ is the tested backward-compatible
  floor recorded in ADR 0006.
- The existing Claude preview schema is current; no ADR is needed.
- The landing page uses the repository's mandated React/Vite stack and GitHub
  Pages rather than introducing a second site framework or hosted service.
- Agent Plugins v1 is an additive portable packaging layer. `AGENTS.md` remains
  the canonical policy, and no MCP server is added because the local CLI and
  host capabilities already cover course startup and tutoring.
- The library manifest is a local allowlist, not a hosted catalogue, remote
  installer, or filesystem scan. Standalone courses remain the distributable
  Agent Plugin boundary.

## Known external evidence

- GitHub Pages is configured with `build_type: workflow`; the current Node 24
  workflow's full build and deploy succeeded in Actions run `29851928963`.
- DNS provider access for `explorables.ai` has not been established. DNS queries
  currently return no A, AAAA, or `www` CNAME records. Exact records are in
  `docs/deployment.md`.
- The five-target-learner completion criterion requires a usability study after
  the runnable vertical slice exists. A feedback record will distinguish this
  external evidence from implementation acceptance checks.
- npm packages are structured at version 0.1.0 but are not published by this
  repository task. The scaffold is verified from the source workspace; external
  installation of the versioned dependencies begins with the release workflow.

## Latest verification

```text
gh auth status                         pass (Doppp, SSH, repo scope)
gh repo view Doppp/explorables         pass (PUBLIC, default master)
git remote -v                          pass (canonical SSH URL)
npm view typescript@7 version          7.0.2
npm view pnpm@11 version               latest 11.21.0; default CI pin 11.15.1
official Node release status           Node 24 is LTS
official Claude Desktop preview docs   launch schema version 0.0.1 confirmed
Agent Skills validation                pass (template and both first-party courses)
Node 22.22.2 / pnpm 10.26.0            pass (frozen install, check, build)
pnpm check                              pass under Node 24 (format, lint, TS7, 24 suites/78 tests, collection/plugin/course validators)
pnpm course:test                        pass under Node 24 (14 model suites/47 tests; 14 starter/reference pairs)
pnpm build                              pass under Node 24 (9 package entries, collection, standalone course, static site)
pnpm test:browser                       pass under Node 24 (12 tests; persisted light/dark themes, sandbox sync, library, safe routes, guided flow, failures, axe, 1427px, 1156px, 720px, 320px)
pnpm site:test                          pass (content, no-tracking copy, axe, 720px)
course UI visual QA                     pass (light/dark library at 1156px, 720px, and 320px; full-width hero/note, no overflow)
generated course smoke                  pass (Agent Plugin manifest/skill, validate, static build)
pnpm audit --audit-level high           pass (no known vulnerabilities)
Pages workflow YAML parse               pass
GitHub Pages API                         pass (workflow source, public, CNAME configured)
GitHub Actions run 29851928963           pass (current actions; build, checks, artifact, deploy)
clean temporary SSH clone                pass (feature branch; frozen install, check, collection/standalone/site build)
DNS A / AAAA / www CNAME                no records returned (external blocker)
```
