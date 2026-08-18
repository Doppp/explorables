# 3D Model Atlas implementation plan

Status: proposed

Planning date: 18 August 2026

Working branch: `research/3d-explorables`

## Purpose

Build a reusable, source-grounded 3D Model Atlas for `explorables`. The atlas will let learners inspect, trace, and compare Transformer-family architectures without turning each course into a bespoke visualization application.

The initial path is:

```text
AI from First Principles
        |
        | exact tiny-model trace and GPT-2 baseline
        v
Open Frontier Models: Shared Techniques
        |
        | architecture normalization and controlled comparison
        v
Inside DeepSeek / Kimi / Qwen / MiniMax / GLM
        |
        | pinned release descriptors and model-specific guided tours
        v
Published-only GPT lineage
```

The atlas complements the existing Markdown lessons, exact tables, exercises, Guided Course Mode, and discovery records. It does not replace them.

## Product outcome

A learner can:

1. Open a model at a comprehensible architectural scale.
2. Follow one token through a representative block.
3. Expand a selected component from overview to mathematical detail.
4. Inspect exact tensor shapes and values when an executable teaching model supplies them.
5. Compare two pinned models and isolate meaningful differences.
6. Distinguish verified configuration, report-derived structure, teaching simplification, and undisclosed detail.
7. Move from a visual component to the corresponding formula, lesson, source, and exercise.
8. Complete the experience without a network connection, production weights, an account, a GPU service, or analytics.

## Decisions carried into implementation

- Keep plain Markdown and the existing `explorable` directive. Do not add a `model`, `scene`, `tour`, or other Markdown directive.
- Run the atlas inside the existing `sandbox="allow-scripts"` iframe with the current restrictive CSP and `connect-src 'none'`.
- Bundle renderer code, descriptors, fonts, shaders, and small teaching data at build time. Do not fetch model assets, tokenizers, scripts, or fonts at runtime.
- Use the existing explorable event and `recordExperiment` channels. Do not add analytics or cross-course learner tracking.
- Keep the explorable module contract framework-neutral. The atlas may expose a helper package, but a course still exports the normal `ExplorableModule` default object.
- Treat the course repository and its pinned primary-source register as the authority for architecture claims.
- Use `open-weight` rather than `open source` unless the applicable code, weights, data, and training artifacts actually justify the broader term.
- Do not imply that a schematic reconstruction reproduces model capability, training results, benchmark scores, or undisclosed implementation details.
- Keep required computation CPU- and browser-friendly. Production checkpoints and production inference are outside the completion path.

These decisions extend the existing product rather than changing its course format. An ADR is still required before implementation because the shared rendering package, descriptor contract, and model-provenance rules will become durable architecture.

## Scope

### Included

- A shared 3D scene and interaction engine for Transformer-family architectures.
- A versioned, validated model-architecture descriptor.
- A separate deterministic trace format for exact teaching-model values.
- Architecture, trace, and comparison modes.
- Guided camera viewpoints and component focus transitions.
- A synchronized semantic outline, tensor inspector, formula/source references, and non-3D fallback.
- A tiny-Transformer pilot and GPT-2 baseline.
- Pinned descriptors and course-owned tours for DeepSeek, Kimi, Qwen, MiniMax, and GLM as their source freezes complete.
- Published-only GPT family representations that visibly retain undisclosed regions.
- Browser, accessibility, sandbox, performance, provenance, and clean-checkout verification.

### Excluded

- Downloading or running full frontier-model weights.
- A general-purpose 3D editor or visual course-authoring system.
- A universal neural-network interchange format.
- Photorealistic rendering, VR, AR, or game mechanics.
- Hosted rendering, remote inference, telemetry, or learner accounts.
- Reverse-engineering proprietary architectures from rumors, benchmark behavior, leaks, or unsourced diagrams.
- Literal rendering of every parameter, neuron, expert, or cache entry in a large model.
- Replacing precise 2D matrices, probability charts, loss curves, BPE views, or code traces when they communicate the concept better.

## Teaching model

The atlas supports three coordinated modes.

### Architecture mode

Show the complete model as a structural map. Repeated layers and experts are aggregated honestly and can be expanded to a representative instance. The view answers:

- What are the main stages?
- Which components repeat?
- Where do residual, routing, attention, cache, and output paths run?
- Which parts differ from the foundation Transformer?
- Which details are verified, simplified, or unknown?

### Trace mode

Follow one token through a deterministic teaching model. A trace frame links scene objects to exact inputs, outputs, shapes, formulas, and code-stage identifiers. The view answers:

- What changed at this step?
- Which tensors contributed to the result?
- What invariant should hold?
- What happens when a mask, residual, route, or cache behavior is broken?

Only executable teaching models receive exact-value traces. A report-derived production architecture must not display fabricated activations.

### Compare mode

Normalize two descriptors to the same visual grammar and emphasize structural differences. Unchanged background structure is subdued. The view answers:

- Which mechanism changed?
- What quantity, memory path, or computation does the change affect?
- Is the difference configuration-derived, report-derived, conceptual, or undisclosed?
- Which controlled experiment in the course tests a consequence of that difference?

Comparison is not a leaderboard and must not imply that architecture alone determines model quality.

## Visual grammar

The scene uses spatial dimensions consistently:

| Visual property | Default meaning |
|---|---|
| Horizontal position | token position or ordered data flow |
| Vertical position | model depth or processing stage |
| Scene depth | heads, experts, channels, or cached history |
| Color | stable component role, reinforced by label and shape |
| Motion | current data flow or a deliberate focus transition |
| Opacity | inactive, skipped, masked, or contextual structure |
| Outline style | provenance or disclosure state where needed |
| Scale | structural magnitude, labelled as literal or symbolic |

The visual grammar must remain stable across courses. A learner should not have to relearn what an attention block, residual path, expert group, cache entry, or unknown region looks like in every model course.

Large counts use aggregation rather than millions of scene objects. Examples include `× 61 repeated blocks`, `256 routed experts`, or a density surface with an explicit count. A representative expansion must state when it is showing one repeated instance.

## Technical architecture

```text
course Markdown
      |
      | existing explorable directive
      v
course atlas module
      |
      +-- validated architecture descriptor
      +-- optional deterministic trace
      +-- optional comparison descriptor
      +-- course-owned focus/tour configuration
      |
      v
@explorables/model-atlas
      |
      +-- scene model and layout
      +-- Three.js renderer
      +-- semantic DOM outline and inspectors
      +-- event and experiment adapter
      +-- fallback renderer
      |
      v
existing sandboxed iframe and message protocol
```

### Rendering choice

Use Three.js behind an internal renderer interface for the first shared implementation. It supplies a maintained scene graph, instanced meshes, picking, camera interpolation, and WebGL resource management without requiring React inside the explorable.

Before accepting the dependency, Milestone 0 must verify:

- compatibility with TypeScript 7 and the supported Node/pnpm matrix;
- bundling inside the existing esbuild-controlled pipeline;
- operation under the current iframe CSP with no runtime network requests;
- acceptable bundle and first-render cost;
- clean teardown and WebGL resource disposal;
- no requirement for `allow-same-origin`, workers, WebGPU, WASM, or remote assets.

Do not use React Three Fiber in the initial implementation. Do not make WebGPU a requirement. A future renderer may use WebGPU behind the same internal scene contract only after browser support and accessibility behavior are independently justified.

### Package boundary

Develop the first tiny-Transformer pilot course-locally. Extract `@explorables/model-atlas` only after the pilot establishes the required primitives and interaction contract.

The shared package owns:

- descriptor and trace schemas;
- normalized scene-model generation;
- deterministic layout helpers;
- rendering and disposal;
- camera viewpoints and focus transitions;
- picking and mirrored semantic selection;
- inspectors and fallback presentation;
- atlas-specific tests and test fixtures.

Courses own:

- pinned model descriptors and source manifests;
- model-specific simplifications and disclosure notes;
- lesson prose, predictions, explanations, and exercises;
- guided checkpoint policy;
- controlled teaching-model computations and conclusions.

The shared package must not contain model marketing claims or silently centralize course prose.

## Descriptor contract

The initial descriptor is a small, versioned Transformer-family schema rather than a generic graph language.

```ts
interface ModelAtlasDescriptor {
  schemaVersion: 1;
  identity: ModelIdentity;
  scale: ModelScale;
  sources: SourceRecord[];
  stages: ModelStage[];
  flows: ModelFlow[];
  disclosures: DisclosureRecord[];
  viewpoints?: AtlasViewpoint[];
}
```

`ModelStage` is a discriminated union of reviewed semantic roles:

- token input and tokenization boundary;
- embedding and positional representation;
- normalization;
- attention or published attention variant;
- residual path or published residual variant;
- dense MLP;
- router and expert group;
- cache or recurrent state;
- output projection and prediction head;
- repeated block group;
- explicitly undisclosed region;
- course-scoped conceptual mechanism approved through schema review.

Each stage includes a stable ID, label, count/repetition information, dimensions when known, visualization role, evidence basis, source references, and simplification notes. Descriptors do not contain executable code, HTML, shaders, URLs to fetch, or arbitrary styling.

### Evidence basis

Every material stage or claim uses one of these values:

| Basis | Meaning |
|---|---|
| `executable` | Supplied by the exact deterministic teaching implementation |
| `configuration-derived` | Directly reconstructed from a pinned official configuration |
| `report-derived` | Supported by a pinned official paper, report, or model card |
| `conceptual` | A clearly labelled teaching simplification |
| `undisclosed` | Public evidence does not establish the detail |

`inferred` remains a claim label in model courses, but inferred structure may only appear when the inference and its inputs are explicit. It must never be rendered with the same confidence treatment as configuration-derived structure.

### Trace contract

Exact numerical execution is separate from architecture description:

```ts
interface ModelAtlasTrace {
  schemaVersion: 1;
  modelId: string;
  traceId: string;
  tokens: TraceToken[];
  frames: TraceFrame[];
}

interface TraceFrame {
  id: string;
  stageId: string;
  operation: string;
  inputs: TraceTensor[];
  outputs: TraceTensor[];
  invariant?: TraceInvariant;
  codeRef?: string;
}
```

The trace is generated from tested course model functions or a committed deterministic fixture. It is bounded in tensor size and contains no production weights. Validators reject stage references that do not exist in the selected descriptor.

### Viewpoints and tours

Viewpoints store camera target, framing, visible stage IDs, and optional selection. They do not store full lesson narration. Ordinary Markdown remains the source of teaching prose; Guided checkpoints and explorable events remain the source of course progression.

An explorable may provide short in-scene labels and action prompts, but it must not fork the lesson into a second proprietary content format.

## Model coverage policy

### Foundation tiny Transformer

- Exact executable descriptor and trace.
- Full token, attention, residual, MLP, output, generation, and cache correspondence.
- Deliberate broken modes for causal masking, residual replacement, cache reuse, and claim-aligned evaluation.
- First source for reusable atlas primitives.

### GPT-2 baseline

- Configuration-derived structural descriptor from pinned official sources.
- Optional tiny or reduced computation mapped to GPT-2-style stages; never presented as GPT-2 activations unless actual pinned weights are deliberately included and reviewed.
- Baseline for decoder-only dense Transformer comparisons.

### Later GPT family

- Use official published information only.
- Show undisclosed architecture regions explicitly.
- Do not infer layer counts, routing, attention mechanisms, training data, parameter counts, or serving topology from rumors or behavior.
- Prefer lineage and disclosure comparison over a false exact reconstruction.

### DeepSeek, Kimi, Qwen, MiniMax, and GLM

- One descriptor per pinned release or deliberately paired lineage release.
- Source freeze and licence review precede descriptor implementation.
- The shared frontier course owns normalization and cross-family comparison method.
- Each `Inside ...` course owns its descriptor interpretation, course-specific tours, controlled reconstructions, and conclusions.
- A descriptor update that changes a material architecture claim requires source review, course-version review, and visual-regression review.

## Accessibility and alternate representations

The canvas is never the only interface to the model.

Every atlas instance must provide:

- a native-control toolbar for reset, previous/next focus, zoom, and view selection;
- a synchronized semantic component outline using native buttons, lists, or tree semantics;
- a component inspector with role, evidence basis, source references, dimensions, repetition counts, and simplification notes;
- a table or ordered trace for every exact numerical frame;
- an ordinary Markdown fallback that remains useful when the explorable cannot run;
- visible keyboard focus and no keyboard trap;
- operation without pointer dragging;
- non-color labels and shape/line distinctions;
- high-contrast light and dark themes;
- reduced-motion behavior that replaces camera travel and flow animation with immediate state changes;
- bounded `aria-live` announcements only for deliberate selections and completed operations;
- a WebGL-unavailable and context-loss fallback that preserves the semantic outline and lesson path.

The visual canvas may be hidden from the accessibility tree when the synchronized semantic representation communicates the complete state. If it remains exposed, it needs a concise accessible name and description; it must not present hundreds of meaningless graphical nodes.

## Sandbox and security requirements

- Retain `sandbox="allow-scripts"` without `allow-same-origin`.
- Retain `connect-src 'none'` and the existing parent/iframe message validation.
- Bundle shaders as reviewed strings; descriptors cannot inject shader source.
- Do not allow descriptor-supplied HTML, CSS, URLs, script identifiers, or arbitrary material definitions.
- Validate all IDs, counts, dimensions, labels, source references, trace values, and viewpoint references before rendering.
- Cap scene-node, repetition, trace-frame, tensor-value, label-length, and experiment-record sizes.
- Dispose geometries, materials, textures, render targets, observers, listeners, and animation frames on destroy.
- Handle WebGL context loss without crashing lesson navigation.
- Keep deterministic trace computation separate from untrusted scene metadata.
- Review any new dependency and committed third-party asset for licence and supply-chain risk.

## Performance budgets

Milestone 0 establishes measured budgets before implementation is promoted. Initial targets are:

- atlas shared JavaScript increase no greater than 250 KB gzip unless an ADR records why the teaching value warrants more;
- no individual descriptor or deterministic trace greater than 250 KB compressed without explicit review;
- no production checkpoint or remote model asset;
- no more than 2,000 rendered instances in a default scene;
- use instancing and aggregation for repeated blocks, heads, experts, and cache entries;
- useful semantic fallback visible immediately while the renderer initializes;
- first interactive atlas state within two seconds on the documented reference machine after local assets are available;
- responsive interaction at the normal and narrow desktop reference widths;
- render only when state, camera, or animation changes rather than maintaining an unnecessary permanent loop.

CI enforces deterministic bundle, descriptor, trace, and node-count limits. Frame-time measurements are recorded on a reference machine because shared CI timing is not a stable pass/fail signal.

## Milestones

### Milestone 0 — decision record, visual grammar, and dependency spike

Deliverables:

- ADR covering the shared atlas boundary, descriptor provenance, rendering dependency, and non-3D fallback.
- Visual grammar and accessibility specification.
- Three.js compatibility spike inside the existing sandbox fixture.
- Measured bundle, scene-count, teardown, CSP, WebGL support, and narrow-layout evidence.
- Licence review for Three.js and any proposed third-party visual assets.
- Updated threat model for descriptors, shaders, WebGL resources, and context loss.

Exit check:

- A sandbox fixture renders and destroys a small instanced scene with no network access or CSP relaxation.
- Keyboard selection and a semantic outline expose the same fixture state.
- The dependency and performance budgets are accepted or revised in the ADR.

### Milestone 1 — course-local tiny-Transformer pilot

Deliverables:

- A course-local architecture descriptor mapped to the existing deterministic tiny Transformer.
- Architecture and trace modes for one token through embeddings, attention, residuals, MLP, output logits, and generation.
- Exact synchronized tensor inspector and code-stage references.
- Guided focus points driven by the existing lesson and checkpoint flow.
- Broken causal-mask and residual-path comparisons.
- Reduced-motion, narrow-layout, light/dark, semantic, and WebGL-unavailable behavior.

Exit check:

- A learner can predict, run, inspect, save evidence, open the associated exercise, and explain one failure without leaving the current course architecture.
- Existing 2D explorables and exercises remain unchanged and usable.
- The pilot passes unit, browser, axe, sandbox, visual, and clean-checkout checks.

### Milestone 2 — shared atlas package and schemas

Deliverables:

- Extract `@explorables/model-atlas` from proven pilot code.
- Zod descriptor and trace schemas with source-position-aware validation where course configuration supplies the entry.
- Deterministic normalized scene model independent of Three.js objects.
- Renderer, semantic outline, inspector, trace stepper, and fallback adapters.
- Stable event vocabulary for selection, viewpoint change, trace step, comparison, reset, and experiment recording.
- Component-gallery examples covering every approved stage role.
- Authoring and testing documentation.

Exit check:

- The tiny pilot uses only the shared public helper contract and course-owned data.
- Invalid, oversized, unsourced, cyclic, or dangling descriptor/trace fixtures fail with actionable diagnostics.
- Mount, resize, theme change, context loss, and destroy behavior are covered.

### Milestone 3 — GPT-2 baseline and comparison mode

Deliverables:

- Pinned official GPT-2 source record and configuration-derived descriptor.
- A normalized dense decoder-only baseline view.
- Comparison layout that aligns common stages and emphasizes additions, removals, repetitions, and changed dimensions.
- Clear symbolic-versus-literal scale labels.
- A foundation lesson or capstone activity comparing the tiny model with GPT-2 structure without claiming equivalent capability.

Exit check:

- Learners can identify what scales and what remains structurally similar.
- Every displayed GPT-2 field resolves to a pinned source or an explicit conceptual simplification.
- Comparison remains operable and understandable without the 3D canvas.

### Milestone 4 — shared frontier architecture laboratory

Deliverables:

- Add the atlas to `Open Frontier Models: Shared Techniques` after that course's source freeze.
- Teach descriptor normalization, evidence basis, missing information, structural cost accounting, and controlled comparison.
- Provide generic, non-branded primitives for dense blocks, MoE routing, attention variants, residual variants, cache/recurrent state, and output strategies only as demanded by frozen course cases.
- Add an exercise that validates and compares two small descriptors.
- Add discovery records for a learner-selected comparison and evidence-based conclusion.

Exit check:

- The shared course teaches comparison method without owning model-specific conclusions.
- A learner can distinguish architecture evidence from benchmark or capability claims.
- Model-specific courses can reuse the grammar without depending on one another.

### Milestone 5 — first model-family validation

Implement one model family whose complete source freeze is ready. The course roadmap currently makes `Inside DeepSeek` the first boundary test; if its final freeze is not ready, do not substitute unsourced details merely to preserve order.

Deliverables:

- Pinned release descriptor with source and licence records.
- Foundation/GPT-2 comparison viewpoint.
- Model-specific architecture tour and one exact controlled reconstruction mapped to representative stages.
- Disclosure and simplification inspector entries.
- Model-specific tests and visual review.

Exit check:

- The atlas accurately supports a real model course without moving its prose or conclusions into the shared package.
- Reviewers can audit every material visual claim from scene object to descriptor to pinned source.

### Milestone 6 — remaining open-weight model families

Roll out independently after each course's source freeze:

1. DeepSeek, if not completed in Milestone 5.
2. Kimi.
3. Qwen.
4. MiniMax.
5. GLM.

The actual order may follow source readiness, but each family remains a separate coherent pull request and course version.

For every family:

- add or update only shared primitives proven to be genuinely reusable;
- implement pinned descriptor and course-owned viewpoints;
- map at least one controlled reconstruction to the atlas;
- include a comparison with the foundation baseline;
- test disclosure, provenance, aggregation, accessibility, and narrow layout;
- record limitations and what the toy experiment cannot establish.

Exit check:

- All five planned model courses have independently auditable atlas experiences.
- No course silently imports another model course's prose, conclusions, or progress state.

### Milestone 7 — published-only GPT lineage

Deliverables:

- A GPT lineage view limited to official public evidence.
- Exact/configuration-derived treatment where justified and undisclosed regions elsewhere.
- A disclosure-focused lesson explaining why model behavior does not reveal a complete architecture.
- Validation that prevents unknown fields from being rendered as ordinary verified stages.

Exit check:

- The atlas is useful even when architecture detail is incomplete.
- No proprietary generation is shown with invented layer, attention, routing, parameter, training, or serving details.

### Milestone 8 — hardening, learner study, and release

Deliverables:

- Full browser matrix at normal and narrow desktop widths, 320 px reflow, light/dark themes, reduced motion, WebGL unavailable, and context loss.
- Axe checks plus manual keyboard and screen-reader review of the semantic representation.
- Deterministic screenshots for representative scenes and comparisons.
- Bundle, descriptor, trace, node-count, resource-disposal, and clean-checkout checks.
- Author guide, descriptor reference, visual grammar, provenance policy, model-update procedure, and contribution checklist.
- Human study using the existing five-learner protocol, comparing the atlas with the current 2D/table path for the same learning objective.
- Recorded decision on broader rollout based on comprehension, task completion, confusion, motion comfort, and accessibility evidence.

Exit check:

- Five target learners complete the tiny-model pilot and one model comparison.
- Results show where 3D materially helps and where the course should retain 2D as primary.
- All supported toolchain, validation, test, build, browser, accessibility, and clean-clone checks pass.

## Test strategy

### Unit and schema tests

- Valid and invalid descriptor variants.
- Evidence-basis and source-reference completeness.
- Repetition aggregation and symbolic scale labels.
- Stage/flow graph containment, dangling references, and permitted cycles for recurrent state.
- Trace-to-stage mapping and bounded tensor values.
- Deterministic normalized scene layout.
- Comparison matching and difference classification.
- Camera viewpoint validation.
- Scene-node and asset-budget enforcement.

### Explorable and sandbox tests

- Mount, resize, theme synchronization, reduced motion, and destroy.
- No runtime network request and unchanged CSP/iframe attributes.
- Event and experiment payload validation.
- Malformed descriptor isolation.
- WebGL initialization failure and context loss.
- Resource disposal and no surviving animation frame or observer.
- One atlas failure does not crash lesson navigation or another explorable.

### Browser and accessibility tests

- Keyboard-only component selection, trace navigation, comparison, and reset.
- Semantic outline and visual selection remain synchronized.
- Exact tensors are available as readable tables.
- Focus remains visible and is restored after view changes.
- No color-only or motion-only meaning.
- Axe at normal, narrow, and 320 px widths.
- Light/dark and forced/reduced-motion behavior.
- WebGL fallback preserves the checkpoint and exercise path.
- Stable screenshots for the tiny model, GPT-2 baseline, and one model-family comparison.

### Course and provenance tests

- Every descriptor model ID and version matches its course source manifest.
- Every material stage has a valid evidence basis and source reference or explicit conceptual/undisclosed treatment.
- Pinned source revisions and licences exist before model-course validation passes.
- Course prose distinguishes reported, reproduced, and inferred claims.
- Controlled traces do not claim to be production-model activations.
- A course remains understandable as plain Markdown without the atlas.

## Pull-request sequence

1. `docs/model-atlas-decision` — ADR, visual grammar, accessibility and threat model.
2. `spike/model-atlas-renderer` — disposable compatibility and budget evidence; no course rollout.
3. `course/tiny-transformer-atlas` — course-local pilot.
4. `feat/model-atlas-package` — schemas, normalized scene model, renderer, semantic UI, validator integration, and gallery.
5. `course/gpt2-atlas-baseline` — GPT-2 descriptor and comparison mode.
6. `course/open-frontier-atlas` — shared comparison laboratory.
7. `course/inside-deepseek-atlas` — first model-family boundary validation.
8. One pull request per remaining source-frozen model family.
9. `course/gpt-lineage-atlas` — published-only proprietary lineage.
10. `feat/model-atlas-hardening` — accessibility, performance, study evidence, docs, and release checks.

Every pull request must keep the repository buildable, preserve unrelated work, update `docs/implementation-status.md` at milestone boundaries, and pass the checks proportional to its risk before merge.

## Risks and mitigations

### 3D increases cognitive load

Mitigation: guided viewpoints, one selected concept at a time, stable visual grammar, immediate reset, synchronized exact representations, and learner testing. Keep 2D primary when it is clearer.

### Architectural diagrams imply false certainty

Mitigation: evidence basis on every material stage, explicit unknown regions, pinned sources, audit paths, and course-versioned descriptors.

### Model families change faster than courses

Mitigation: pin releases and source revisions, separate family courses, retain old versions as lineage, and require review rather than silently following latest artifacts.

### Rendering becomes a second application framework

Mitigation: keep the public contract small, extract only after the pilot, keep prose in Markdown, reject arbitrary scene code/configuration, and avoid a visual editor.

### Accessibility is relegated to fallback text

Mitigation: make the semantic outline and inspector first-class synchronized interfaces, not a static apology shown only on failure.

### Large scenes perform poorly in narrow host panes

Mitigation: aggregation, instancing, node budgets, event-driven rendering, guided framing, semantic fallback, and explicit reference-width tests.

### Third-party code weakens the sandbox

Mitigation: bundle reviewed dependencies, retain the existing CSP and opaque origin, prohibit runtime fetches, validate descriptors, and add explicit security tests.

### Shared primitives erase meaningful model differences

Mitigation: normalize visual roles but preserve model-owned descriptors, disclosure notes, tours, experiments, prose, and conclusions.

## Initiative definition of done

- A shared atlas package supports architecture, trace, and comparison modes through the existing `ExplorableModule` contract.
- The course format still uses plain Markdown with only `explorable` and `exercise` directives.
- The sandbox remains `allow-scripts` only with no network access by default.
- The tiny Transformer has an exact, deterministic, inspectable 3D trace.
- GPT-2 provides a pinned dense decoder-only comparison baseline.
- The shared frontier course teaches source-aware architecture normalization and comparison.
- DeepSeek, Kimi, Qwen, MiniMax, and GLM each have a pinned, independently auditable descriptor and course-owned atlas experience after their source freezes.
- The GPT lineage shows only published information and preserves undisclosed regions.
- Every visual claim is traceable to executable evidence, an official pinned source, an explicit inference, a conceptual simplification, or an undisclosed marker.
- Every atlas task is fully operable by keyboard and has a synchronized semantic and numerical representation.
- Reduced-motion, light/dark, narrow-layout, WebGL-unavailable, context-loss, sandbox, and failure-isolation behavior pass.
- No production weights, remote inference, account, backend, analytics, audio, new directive, or visual authoring system is introduced.
- Five target learners complete the pilot and comparison study, and the findings determine where 3D is promoted or kept secondary.
- The full repository check, build, course validation, browser, accessibility, supported-toolchain, and clean-checkout suites pass.

## Research basis

- [Brendan Bycroft's LLM Visualization](https://bbycroft.net/llm) and its [MIT-licensed source](https://github.com/bbycroft/llm-viz) demonstrate spatial model overview, camera-guided focus, execution flow, and aggregation across model scales.
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) demonstrates a stable visual vocabulary and progressive movement from system overview to tensor operations. Its artwork is inspiration only unless asset licensing is separately confirmed.
- [Transformer Explainer](https://poloclub.github.io/transformer-explainer/) and its [MIT-licensed source](https://github.com/poloclub/transformer-explainer) demonstrate token-centric flow, overview/detail transitions, direct parameter manipulation, and in-situ guidance.
- The [Transformer Explainer CHI 2026 paper](https://minsuk.com/papers/transformer_explainer-chi26.pdf) reports a 90-participant controlled study in which the interactive tool improved quiz accuracy over blog and video baselines. That evidence supports interactivity, coherent flow, and guidance; it does not independently establish that 3D is superior to a well-designed 2D representation.

## First implementation decision

Begin with Milestone 0 and do not start by modeling every announced architecture. The first implementation target is the existing deterministic tiny Transformer because it gives the atlas a complete truth source, exact values, known failure modes, and a direct path into the current course exercises. GPT-2 and source-frozen model families follow only after the visual grammar and provenance contract survive that pilot.
