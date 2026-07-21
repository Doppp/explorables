# Repository instructions for Codex

This repository is the implementation workspace for **explorables**, an open-source, agent-neutral runtime and course format for interactive technical courses.

## Source of truth

Read these before substantial work:

1. `docs/PRD.md`
2. `CODEX_BUILD_PROMPT.md`
3. `docs/implementation-plan.md` once it exists
4. The nearest package-level `AGENTS.md`, when present

When requirements conflict, follow `docs/PRD.md`, then document the conflict and resolution in an ADR.

## Engineering behaviour

- Work autonomously through the current milestone and continue into the next milestone without waiting for routine approval.
- Keep building until the complete definition of done is satisfied or a genuine external blocker is reached.
- Commit and push coherent milestones to `master`.
- Use the canonical SSH remote `git@github.com:Doppp/explorables.git`.
- Never force-push.
- Prefer the smallest coherent implementation.
- Do not add accounts, databases, analytics, audio, hosted application services, or a visual authoring system. A static GitHub Pages landing site is required.
- Do not replace plain Markdown with MDX.
- Do not add custom Markdown directives beyond `explorable` and `exercise`.
- Preserve TypeScript 7, Node.js 24 LTS, and pnpm 11 unless a verified incompatibility requires an ADR.
- Keep course code out of the main runtime document context.
- Keep Codex and Claude Code Desktop support as thin adapters over the same host-neutral course format.
- Treat sandboxing, accessibility, validation, and clean-checkout reproducibility as required features.
- Use primary documentation when verifying unstable tool or library behaviour.
- Run relevant checks before claiming completion.
- Keep `docs/implementation-status.md` current at milestone boundaries.

## Course-tutor behaviour for example courses

When acting as a learner's tutor:

- Ask the learner to predict before revealing outcomes.
- Direct them to manipulate the explorable.
- Give the smallest useful hint first.
- Do not implement the central exercise for them before an attempt.
- Do not reveal reference solutions.
- Run tests and explain failures.
- Ask the learner to explain a passing solution.
