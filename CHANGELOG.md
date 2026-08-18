# Changelog

All notable changes to `explorables` are documented here.

## Unreleased

### Added

- Opt-in Guided Course Mode with ordered learner and explorable-event checkpoints.
- Versioned browser-only progress, deep-link recovery, explicit lesson skipping, confirmed Explore mode, reset, and a local question parking lot.
- Guided checkpoints and focus-aware tutor policy across all thirteen `AI from First Principles` lessons.
- Course validation for missing, duplicate, and invalid guided checkpoints.
- A framework-owned course-session panel with portable start, resume, pause, review, Explore, restart, reset, and finish language.
- Versioned browser-only lesson resume for persistent courses and exact Guided checkpoint resume, including confirmed rollback from a completed checkpoint.
- Read-only `data-explorables-*` learning-state attributes for host inspection.
- Visible browser-storage availability and same-origin resume guidance.

### Changed

- `AI from First Principles` is versioned as `0.3.0-guided.1`.
- The product requirements, architecture, authoring guide, implementation plan, status, and model-learning roadmap now include guided delivery.
- The local course server now treats its default port as strict. An occupied port fails with an actionable message instead of silently changing the browser-storage origin.
- First-party and scaffolded host adapters now use browser course state as the progress authority and distinguish pausing from finishing or resetting.

### Security

- Guided progress and course-session state remain in the main browser document. Sandboxed explorables retain their existing opaque origin, restrictive CSP, and no-network policy.
