# Implementation status

Updated: 22 July 2026

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

## Current work

Milestone 5 deployment: the verified MVP commit is on `master`, Pages uses the
Actions source, the static deployment succeeded, and repository settings name
`explorables.ai`. Local implementation milestones 1–5 are complete. Only
external DNS and learner-study evidence remain.

## Decisions

- The installed global Node 26, pnpm 9, and TypeScript 5 are not used as the
  compatibility claim. The repository pins Node 24/pnpm 11/TypeScript 7 and all
  acceptance checks run through those pinned versions.
- The existing Claude preview schema is current; no ADR is needed.
- The landing page uses the repository's mandated React/Vite stack and GitHub
  Pages rather than introducing a second site framework or hosted service.

## Known external evidence

- GitHub Pages is configured with `build_type: workflow`; its first full build
  and deploy succeeded in Actions run `29851762912`.
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
npm view pnpm@11 version               latest 11.15.1
official Node release status           Node 24 is LTS
official Claude Desktop preview docs   launch schema version 0.0.1 confirmed
pnpm check                              pass (format, lint, TS7, 22 unit tests, validators)
pnpm course:test                        pass (6 model suites; each starter fails/reference passes)
pnpm build                              pass (9 package entries, both courses, static site)
pnpm test:browser                       pass (sandbox interaction, navigation, axe, 720px)
pnpm site:test                          pass (content, no-tracking copy, axe, 720px)
generated course smoke                  pass (validate, 2 tests, static build)
pnpm audit --audit-level high           pass (no known vulnerabilities)
Pages workflow YAML parse               pass
GitHub Pages API                         pass (workflow source, public, CNAME configured)
GitHub Actions run 29851762912           pass (build, checks, artifact, deploy)
DNS A / AAAA / www CNAME                no records returned (external blocker)
```
