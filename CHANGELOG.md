# Changelog

All notable changes to `explorables` are documented here.

## Unreleased

### Added

- Opt-in `teaching.mode: tutor-led` presentation: the coding-agent conversation leads the live
  lesson while the browser defaults to checkpoint, explorable, evidence, exercise, and collapsed
  reference notes. Stable `data-tutor-*` state keeps host inspection provider-neutral.
- Two beginner lessons before the learning loop: `Generative AI and language models` and `The
  next-token loop`, each with a deterministic accessible explorable and guided discovery cycle.
- ADR 0011 and a reviewed beginner-curriculum research note covering the supplied sources and their
  relevant linked learning paths.
- Shared explorable list padding that keeps ordered markers inside panel borders at narrow widths.
- A learner-facing course overview route compiled from `COURSE.md`, with audience, prerequisites,
  estimated effort, lesson count, and browser-local Start/Resume behavior before Lesson 1.
- Contextual discovery checkpoint controls that preserve definition → prediction → explorable →
  application → reflection order without adding another Markdown directive.
- A new beginner orientation, `How machines learn`, and a one-parameter training-loop explorable
  before Gradient Descent in `AI from First Principles`.

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

- `AI from First Principles` is versioned as `0.6.0-tutor-led.1`, now contains sixteen lessons, and
  uses Codex/Claude conversation as the primary teaching surface. Its browser-progress namespace is
  intentionally fresh; earlier local progress remains untouched under its prior course version.
- Scaffolded courses now opt into tutor-led delivery while existing courses without `teaching`
  retain browser-led full-lesson rendering.
- `AI from First Principles` is versioned as `0.5.0-onboarding.1`, now contains fourteen lessons,
  and explicitly supports technical learners with no prior machine-learning or calculus knowledge.
  The new course version intentionally creates a fresh browser-progress namespace while leaving
  earlier version data untouched.
- Discovery lessons now keep their checkpoint summary near the lesson header while placing the
  active learner control in the lesson's instructional context.

- Reframed the local collection home as a general, status-first course library: available courses are primary, planned AI courses sit in a quieter roadmap, and visible product branding now uses `Explorables` while technical identifiers remain lowercase.
- `AI from First Principles` is versioned as `0.4.0-foundations.1`, with self-contained canonical
  lesson prose, prerequisite bridges, worked examples, implementation connections, failure modes,
  and explanation-based recaps across all thirteen lessons. Because browser progress is scoped to
  the course version, existing `0.3.0-guided.1` progress does not resume in this new edition. The
  browser-rendered Markdown supplies the foundational explanation; the coding-agent tutor adapts,
  questions, and clarifies it instead of acting as the only source of definitions or concepts.
- The course-format requirements now define browser-rendered lesson Markdown as the canonical
  explanation and align the lesson-flow, tutor-policy, authoring, and acceptance examples with that
  boundary.
- The product requirements, architecture, authoring guide, implementation plan, status, and model-learning roadmap now include guided delivery.
- The local course server now treats its default port as strict. An occupied port fails with an actionable message instead of silently changing the browser-storage origin.
- First-party and scaffolded host adapters now use browser course state as the progress authority and distinguish pausing from finishing or resetting.

### Security

- Guided progress and course-session state remain in the main browser document. Sandboxed explorables retain their existing opaque origin, restrictive CSP, and no-network policy.
- Model Atlas data cannot supply executable code, markup, styles, shaders, or runtime URLs. Three.js remains inside the existing opaque-origin, no-network iframe and does not require production weights or relaxed permissions.
