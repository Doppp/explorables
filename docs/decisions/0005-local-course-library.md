# ADR 0005: Local course library and model-learning tracks

Status: accepted Date: 12 August 2026

## Context

The runtime originally accepted exactly one course root. That remains the right distribution boundary for an independently installable Agent Plugin, but the main repository now defines a family of prerequisite and model-specialization courses. Learners need to see that path and select locally available courses without a hosted LMS, account, database, remote catalogue, or filesystem scan.

The product also needs real frontier models to ground the foundation without making a durable introductory course track individual releases in depth.

## Decision

Add an optional `explorables.library.json` at a collection root. It explicitly orders tracks and contains two entry types:

- `available` entries point to a relative, contained course root and derive learner-facing metadata from that course's `COURSE.md`;
- `planned` entries provide enough metadata to show the intended path while remaining visibly unavailable.

`explorables start <path>` and `explorables build <path>` detect either a standalone `COURSE.md` or a collection manifest. Collection mode serves a library index and namespaces course data and assets by validated course ID. Standalone commands, course schemas, plugin manifests, skills, and tutoring policies remain unchanged.

The model-learning curriculum has three layers:

1. `AI from First Principles` remains vendor-neutral and adds short real-model connections in ordinary Markdown.
2. `Open Frontier Models: Shared Techniques` owns artifact reading, accounting, controlled comparison, provenance, and claim labels.
3. Each model family remains a separate versioned course with pinned primary sources and controlled reconstructions.

The library displays prerequisites as an ordered path but does not lock courses. Planned cards are not install buttons, and the runtime does not clone repositories or install dependencies.

## Consequences

- A collection remains fully local and statically buildable.
- Course packages can be extracted into independent repositories without changing their format.
- Browser progress remains isolated by course ID and version.
- Collection validation must reject duplicate IDs, absolute paths, traversal, symlink escapes, and invalid contained courses.
- A bad or missing course route must fail independently.
- Adding a public catalogue or remote installer remains a separate, trust-sensitive feature.
