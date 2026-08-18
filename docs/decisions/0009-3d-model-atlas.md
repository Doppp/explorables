# ADR 0009: source-grounded 3D Model Atlas

Status: accepted

Date: 18 August 2026

## Context

The foundation course already exposes exact Transformer calculations through accessible tables and controls. Planned model-family courses need an additional representation for model depth, repeated blocks, routed experts, residual paths, cache state, and architectural comparison. Separate bespoke 3D applications would duplicate interaction code and make visual meaning inconsistent across courses.

Architecture diagrams also create an evidence risk. Public configurations, reports, executable teaching models, and proprietary disclosures provide different levels of certainty. A visually convincing scene must not turn a teaching simplification or undisclosed region into an apparent fact.

## Decision

Add a reusable `@explorables/model-atlas` package after validating the interaction through a course-local tiny-Transformer pilot. The atlas uses Three.js behind an internal renderer boundary and continues to mount through the existing framework-neutral `ExplorableModule` contract.

The atlas has three coordinated modes:

- architecture mode for aggregated model structure;
- trace mode for exact values from a deterministic teaching model;
- comparison mode for source-grounded structural differences.

Architecture descriptors are inert, versioned data. Every material stage identifies its evidence as executable, configuration-derived, report-derived, conceptual, or undisclosed and links to a pinned source record. Exact numerical traces remain separate and may only come from tested teaching-model code or committed deterministic fixtures.

The 3D canvas is a progressive enhancement. A synchronized semantic outline, component inspector, exact tensor tables, native controls, reduced-motion behavior, and a WebGL-unavailable fallback expose the same learning task without relying on spatial navigation, color, or motion.

All renderer code, shaders, descriptors, fonts, and teaching data are bundled by the existing controlled pipeline. The iframe remains `sandbox="allow-scripts"` without `allow-same-origin`; `connect-src 'none'` remains unchanged. The atlas does not require WebGPU, WASM, remote model assets, production weights, analytics, or a new Markdown directive.

## Consequences

- Courses share a stable visual grammar while retaining their own prose, source interpretation, exercises, descriptors, and conclusions.
- Three.js becomes a reviewed browser dependency, but React Three Fiber and a second application framework are avoided.
- Large layer, head, expert, and cache counts require aggregation and instancing rather than literal scene objects.
- Model source freezes and licence review precede model-family descriptors.
- Proprietary GPT lineage views preserve undisclosed regions rather than filling them with inference or rumor.
- A descriptor schema, renderer lifecycle, semantic mirror, context-loss behavior, performance budgets, and provenance validation become tested public responsibilities.
- Existing 2D representations remain primary wherever they communicate matrices, distributions, code, or exact values more clearly.

## Rejected alternatives

### Build one custom 3D application per model family

Rejected because it duplicates rendering and accessibility work, fragments visual meaning, and makes comparison unreliable.

### Run full browser models for every architecture

Rejected because production weights, tokenizer downloads, WASM assets, startup time, and network requirements conflict with the local-first sandbox and are unnecessary for structural learning.

### Put all model narration in a scene or tour format

Rejected because plain Markdown remains the readable, portable teaching source. Atlas viewpoints can focus a scene but do not create a second lesson language.

### Require WebGPU

Rejected for the initial implementation because WebGL through Three.js is sufficient, more broadly available, and can be hidden behind a renderer boundary if a future implementation justifies WebGPU.
