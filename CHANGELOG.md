# Changelog

All notable changes to `explorables` are documented here.

## Unreleased

### Added

- `@explorables/model-atlas`, a source-grounded 3D architecture and trace renderer with strict inert schemas, evidence labels, reviewed source references, semantic controls, exact tensor tables, WebGL fallback, comparison mode, and deterministic cleanup.
- A learner-facing Transformer Model Atlas in `AI from First Principles` covering the exact tiny teaching model, published GPT-1/2/3 configurations, GPT-4's explicit disclosure boundary, and source-gated DeepSeek V4, Kimi K3, Qwen 3, MiniMax M1, and GLM 5.2 mechanism views.
- Model Atlas descriptor validation, scene/bundle budgets, renderer and comparison tests, and first-party browser interaction/accessibility coverage.

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
- Model Atlas data cannot supply executable code, markup, styles, shaders, or runtime URLs. Three.js remains inside the existing opaque-origin, no-network iframe and does not require production weights or relaxed permissions.
