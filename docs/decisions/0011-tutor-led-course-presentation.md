# ADR 0011: Tutor-led course presentation

**Status:** Accepted  
**Date:** 20 August 2026

## Context

The first foundation course rendered its complete explanation, checkpoint controls, explorable,
exercise context, and recap in the browser. Although Codex had a tutoring policy, the browser was a
self-contained lesson and the conversation had little necessary teaching work. That contradicted
the intended experience: a coding-agent teacher beside an explorable workbench.

The durable course must still be readable on GitHub and usable by another host. The runtime cannot
depend on a private Codex/Claude bridge, a conversation transcript, another Markdown directive, or
weaker iframe isolation.

## Decision

Add the opt-in course profile `teaching.mode: tutor-led`.

- Lesson Markdown remains the canonical durable subject record.
- The coding agent initiates and adapts the live teaching loop from that record.
- Guided browser pages default to a tutor handoff, current checkpoint, explorable, evidence, and
  exercise. Full prose is available in an accessible reference-notes disclosure.
- Explore mode and courses without the profile retain full-lesson browser rendering.
- Stable read-only `data-explorables-*` and `data-tutor-*` attributes expose current scope for host
  inspection. They cannot modify progress and contain no solution or assessment data.
- Host adapters remain thin and the sandbox CSP, permissions, and no-network boundary do not
  change.

## Consequences

The conversation now has a clear primary role without making course knowledge ephemeral. Course
authors must write both complete reference prose and operational tutor policy. A learner without a
connected tutor can open reference notes or choose Explore mode. The runtime gains a presentation
branch but no new content syntax, backend, provider dependency, or progress store.
