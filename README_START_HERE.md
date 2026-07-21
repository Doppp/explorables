# Start here

This folder contains everything needed to hand the explorables MVP to Codex or Claude Code Desktop.

## Files

- `docs/PRD.md` — authoritative product specification
- `CODEX_BUILD_PROMPT.md` — detailed implementation assignment
- `AGENTS.md` — canonical repository instructions
- `CLAUDE.md` — thin Claude Code Desktop adapter

## Recommended setup

1. Create an empty Git repository for explorables.
2. Copy the contents of this folder into the repository root.
3. Commit the three files before implementation begins.
4. Open the repository folder in Codex or Claude Code Desktop.
5. Start a new agent thread attached to that repository.
6. Paste the kickoff prompt below.

## Kickoff prompt

```text
Build the agent-neutral `explorables` v0.1 MVP described in docs/PRD.md, including the static landing page at `explorables.ai`, first-class support for Codex and Claude Code Desktop, and the public GitHub repository at `git@github.com:Doppp/explorables.git` using the `master` branch.

Read AGENTS.md and CODEX_BUILD_PROMPT.md first, then read docs/PRD.md fully. Begin with Phase 0: inspect the repository, verify the required toolchain, and create docs/implementation-plan.md and docs/architecture.md. After that, proceed through the implementation phases autonomously.

Do not broaden the product into an LMS. Keep the architecture local-first, open-source, Markdown-based, TypeScript-based, and backend-free. Use the acceptance criteria and required verification in CODEX_BUILD_PROMPT.md as the definition of done.

Ask only when a decision would materially contradict the PRD or a genuine external permission/DNS blocker exists. Otherwise make a reasonable choice, document it, implement it, test it, commit it, push it, and continue until all acceptance criteria are complete.
```

## Why the PRD should live in the repository

Codex works directly with the files in the selected workspace. Keeping the PRD under `docs/PRD.md` means it can:

- Read it whenever context is needed
- Cite precise sections in plans and ADRs
- Keep implementation and specification versioned together
- Review diffs against the source requirements
- Avoid depending on a temporary chat attachment

`AGENTS.md` is automatically used as repository guidance by Codex, so it is the right place for short, persistent engineering rules. The long implementation assignment remains in `CODEX_BUILD_PROMPT.md` to avoid overloading `AGENTS.md`.
