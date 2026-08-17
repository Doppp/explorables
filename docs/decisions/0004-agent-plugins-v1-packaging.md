# ADR 0004: Package courses as Agent Plugins v1

- Status: accepted
- Date: 12 August 2026

## Context

The original PRD made `AGENTS.md` canonical and deferred optional Codex- or Claude-specific skills. Agent Plugins v1 now defines a vendor-neutral package root with `plugin.json` and fixed discovery for Agent Skills and MCP servers. The repository had no portable plugin manifest and therefore did not conform.

## Decision

Every first-party and newly scaffolded course is a self-contained Agent Plugins v1 package:

```text
course/
├── plugin.json
├── skills/start-course/SKILL.md
├── AGENTS.md
├── CLAUDE.md
├── COURSE.md
└── ...
```

The plugin `name` and `version` match the course frontmatter. The portable `start-course` Agent Skill resolves the plugin root and delegates to `AGENTS.md`, which remains the canonical teaching policy. `CLAUDE.md` and `.claude/launch.json` remain thin compatibility adapters.

No MCP server is added. Starting and tutoring a course already uses local files, the existing CLI, and host browser/terminal capabilities; an MCP process would increase installation and permission surface without adding a portable capability.

The course validator checks package-path containment, the v1 manifest, identity/version alignment, and all immediate-child skills under `skills/`. The scaffold emits the same structure.

## Consequences

- Courses are discoverable by conforming Agent Plugins clients without changing the runtime or course content format.
- Agent Skills provide progressive disclosure while `AGENTS.md` prevents policy drift across hosts.
- Existing direct-repository flows continue to work.
- `.codex-plugin/plugin.json`, `.mcp.json`, and client-specific skill copies are not the portable source of truth.
- Future Agent Plugins specification versions require an explicit schema and validation update rather than an implicit latest-version fetch at runtime.
