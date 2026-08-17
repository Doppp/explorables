# ADR 0003: opt-in guided course mode

Status: accepted Date: 30 July 2026

## Context

Tutor instructions encourage a strong teaching sequence but do not prevent a learner from navigating ahead or losing the current lesson focus. The runtime previously had no formal current-stage state. A hard restriction would be misleading because learners own the repository and can always inspect its files.

## Decision

Add an opt-in Guided Course Mode to the host-neutral course schema and runtime. Courses declare mode policy in `COURSE.md`; guided lessons declare ordered checkpoints in frontmatter. Checkpoints complete through an explicit learner acknowledgment or an exact event from a stable explorable instance.

Guided mode locks future lesson navigation and redirects locked deep links. Courses may allow explicit skipping and a confirmed Explore mode. Returning to Guided mode restores the previous guided position. A local question parking lot supports redirection without discarding learner curiosity.

When enabled, progress is stored in namespaced, versioned browser `localStorage`. It remains local, resettable, non-essential, and inaccessible to opaque-origin explorable iframes. No backend, account, analytics, host API, new Markdown directive, or automatic exercise execution is introduced.

## Consequences

- Existing courses remain unrestricted unless they opt in.
- Course authors must assign stable explorable IDs to event checkpoints.
- Runtime completion is workflow state, not proof of understanding or grading.
- Course-version changes intentionally start a separate local progress record.
- Tutor policy redirects digressions but honors explicit learner choices to skip or explore.
