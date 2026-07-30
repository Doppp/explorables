# Changelog

All notable changes to `explorables` are documented here.

## Unreleased

### Added

- Opt-in Guided Course Mode with ordered learner and explorable-event
  checkpoints.
- Versioned browser-only progress, deep-link recovery, explicit lesson
  skipping, confirmed Explore mode, reset, and a local question parking lot.
- Guided checkpoints and focus-aware tutor policy across all thirteen
  `AI from First Principles` lessons.
- Course validation for missing, duplicate, and invalid guided checkpoints.

### Changed

- `AI from First Principles` is versioned as `0.3.0-guided.1`.
- The product requirements, architecture, authoring guide, implementation plan,
  status, and model-learning roadmap now include guided delivery.

### Security

- Guided progress remains in the main browser document. Sandboxed explorables
  retain their existing opaque origin, restrictive CSP, and no-network policy.
