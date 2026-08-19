# Model visualisation course-integration implementation plan

- **Status:** Accepted plan; implementation not started
- **Date:** 19 August 2026
- **Branch:** `codex/model-visualisation-research`
- **Primary course:** `examples/ai-from-first-principles`
- **Follow-on courses:** `open-frontier-models` and the planned model-family courses

## 1. Objective

Improve the existing model-learning courses with the most useful interaction patterns from
[hfviewer](https://hfviewer.com/) and [ModelMap](https://modelmap.cc/) without turning
`explorables` into a hosted general-purpose model viewer.

The implementation should let a learner:

1. replay a deterministic computation one meaningful step at a time;
2. see typed information paths, residual routes, repetition, and cache reuse;
3. drill from a model overview into the exact scalar or tensor calculation that supports it;
4. compare source-grounded structures without confusing scale, topology, absence, and
   nondisclosure;
5. inspect work and memory under explicit assumptions; and
6. move from lesson prose to the relevant stage, evidence, and tensor row.

The learning loop remains:

```text
predict -> replay -> inspect evidence -> manipulate -> implement -> debug -> explain
```

## 2. Product boundary

### In scope

- Exact forward/backward replay for deterministic teaching models.
- Native 2D information-path diagrams where topology matters.
- Progressive disclosure of repeated blocks and selected calculations.
- Source-grounded Atlas connections and aligned structural differences.
- Exact teaching-unit work/memory lenses and clearly labelled assumption-derived estimates.
- Local prose-to-stage focus after a course-local pilot proves the interaction.
- Reuse in the shared frontier course and model-family courses after the foundation pilot is
  stable.

### Out of scope

- Live Hugging Face search, arbitrary repository ingestion, remote model code, or API tokens.
- Production weights, tokenizer downloads, production tensor traces, GPUs, or hosted execution.
- Accounts, bookmarks, community articles, analytics, newsletters, or a model catalogue.
- Claimed hardware latency or throughput without a controlled measured harness.
- Literal rendering of every layer, head, expert, parameter, or checkpoint tensor.
- A canvas-only learning task, colour-only differences, or pointer-only node selection.
- A new Markdown directive, MDX, a visual authoring system, or narration stored inside a scene.
- More elaborate 3D interaction where a 2D path, matrix, table, or timeline communicates better.

## 3. Non-negotiable design rules

1. **Pilot locally before standardising.** Build the first information-path and replay interaction
   in `AI from First Principles`; promote only the proven contract into shared packages.
2. **Separate structure, execution, and cost.** Architecture descriptors, exact traces, and
   resource calculations remain distinct data with distinct evidence labels.
3. **Never infer missing topology.** Alignment is author-declared, not guessed from similar names.
   Proprietary and unfrozen regions remain explicit.
4. **Semantic controls are complete.** Native buttons, lists, tables, text, and provenance expose
   the whole task. SVG, canvas, and WebGL are synchronized enhancements.
5. **Exact and estimated values look different.** Every number is labelled as executable,
   configuration-derived, report-derived, assumption-derived estimate, or undisclosed.
6. **The sandbox does not widen.** Explorables remain opaque-origin `allow-scripts` iframes with
   `connect-src 'none'`; no remote assets or new browser capabilities are introduced.
7. **Keep course code small.** Extend existing explorables instead of adding another large
   explorable to the already dense inference/capstone lesson.
8. **Default to paused motion.** Replay is learner-controlled, respects reduced motion, and never
   completes a checkpoint on initial render.
9. **One state model owns selection.** Replay buttons, direct stage selection, prose focus,
   comparison, semantic fallback, and graphical highlights must never maintain independent active
   selections.

## 4. Delivery sequence

```text
WP0 Baseline and decision gate
        |
        v
WP1 Exact Transformer replay pilot
        |
        +---------> WP2 Backprop and attention drill-down
        |
        v
WP3 Atlas topology and structural comparison
        |
        +---------> WP4 KV-cache work/memory lenses
        |
        v
WP5 Prose-to-stage focus gate
        |
        v
WP6 Frontier-course adoption contract
        |
        v
WP7 Hardening, documentation, and clean-checkout verification
```

WP1 is the required proof. WP3 does not publish a new Atlas schema until WP1 demonstrates that
typed paths improve the stated learner task. WP5 does not change the host/iframe protocol until
local focus controls have been playtested.

## 5. Work packages

### WP0 - Baseline and decision gate

**Goal:** Freeze the learner tasks, current behaviour, and public-boundary decisions before code
changes.

Deliverables:

- Record baseline normal, narrow, light, dark, reduced-motion, and WebGL-unavailable behaviour for
  the current Transformer block, KV-cache lab, and Model Atlas.
- Define stable learner-facing IDs for stages, connections, and trace steps.
- Define the initial connection vocabulary:
  - `flow`
  - `attention-mix`
  - `residual`
  - `cache-read`
  - `cache-write`
  - `routing`
- Define number labels and display rules for exact, source-derived, estimate, absent,
  not-applicable, undisclosed, and source-freeze-pending values.
- Define topology-coverage labels for `complete`, `partial`, and `undisclosed`, including the scope,
  explanation, evidence, and reviewed sources required for each claim.
- Decide in an ADR whether the proven topology becomes Atlas schema version 2 and whether the
  optional focus protocol is justified. Amend ADR 0009 only for clarifications; record a new ADR
  for a materially new public schema or sandbox message.
- Preserve lesson and checkpoint IDs. Decide the course-version transition before merging the
  first change that alters checkpoint completion semantics.

Exit criteria:

- The learner questions and data/evidence vocabulary are reviewed against the PRD.
- No implementation task depends on live or unpinned external data.

### WP1 - Exact Transformer replay pilot

**Goal:** Make one token's path through the existing deterministic Transformer causally legible.

Primary locations:

- `examples/ai-from-first-principles/explorables/transformer-block/`
- `examples/ai-from-first-principles/explorables/model-atlas/`
- `examples/ai-from-first-principles/lessons/09-transformer-block.md`
- `examples/ai-from-first-principles/lessons/11-autoregressive-inference-kv-caching.md`

Deliverables:

- Give every exact trace step a stable ID, ordered sequence, stage/connection IDs, short operation
  and claim text, and explicit input/output tensor references.
- Represent every trace tensor by stable ID, name, semantic role, shape, and exact values. Validate
  that shape products match value counts; do not extend the current rectangular `values` matrix,
  which only works accidentally while sequence length equals model width.
- Add native `Back`, `Next`, `Restart`, and direct-step controls. Do not add autoplay in the first
  pass.
- Render a small accessible information-path view with an attention update, two residual bypasses,
  an MLP update, and the output path.
- Synchronize the active step across:
  - the semantic ordered list;
  - the 2D path;
  - the existing exact tensor/value table;
  - the explanatory status text; and
  - the optional 3D Atlas highlight.
- Make broken residual mode remove or mark the bypass and identify the first divergent step without
  hiding the correct path.
- Add local claim-focus buttons such as `Show where positions mix`, `Show the identity path`, and
  `Show where logits appear`.
- Emit a meaningful completion event only after the learner advances through or explicitly selects
  the required evidence step; initial render emits no completion.

Implementation boundary:

- Keep the trace controller course-local for this work package.
- Use DOM/SVG plus native controls; do not add a diagramming framework.
- Reuse the tested tiny-Transformer calculations. Do not synthesize production-family tensors.
- Generate replay data directly from the tested `forward()` result. The renderer consumes the
  trace and must not independently recalculate model values.

Exit criteria:

- A keyboard-only learner can identify the first cross-token mixing stage and explain what the
  residual preserves.
- Broken mode reveals the first divergence in both the visual and semantic representations.
- Existing exact tensor values remain unchanged and unit-tested.

### WP2 - Backpropagation and attention drill-down

**Goal:** Validate the replay and progressive-disclosure grammar in two different mathematical
interactions before extracting shared infrastructure.

Primary locations:

- `examples/ai-from-first-principles/explorables/backpropagation/`
- `examples/ai-from-first-principles/explorables/attention/`
- `examples/ai-from-first-principles/explorables/multi-head-attention/`
- lessons 2, 7, and 8

Deliverables:

#### Backpropagation

- Replace the table-only presentation with a semantic node-edge computation graph backed by the
  same table.
- Replay forward values, then reverse gradients and local derivative factors.
- Make the broken chain-rule mode visibly remove or invalidate the exact factor that finite
  differences contradict.

#### Self-attention and multi-head attention

- Let the learner choose one query/key cell or token/head path.
- Progressively reveal:

  ```text
  q dot k -> scale -> causal mask -> softmax row -> value contribution -> weighted sum
  ```

- Continue the selected path through head concatenation and the output projection in lesson 8.
- Keep full matrices and text explanations available; do not require spatial navigation.
- Preserve lesson 7's discovery experiment record and make the selected path part of its saved
  evidence where bounded scalar output is sufficient.

Promotion gate:

- After the same controller pattern works in Transformer replay, Backpropagation, and Attention,
  decide whether to keep it course-local or extract a small framework-neutral helper. Do not create
  a new package solely for one course.
- The candidate shared helper is a pure reducer/controller with `first`, `previous`, `next`, `last`,
  and `seek` transitions plus explicit first-divergence comparison. Rendering remains separate.

Exit criteria:

- Learners can name the missing backpropagation factor and reproduce one selected attention output
  from its contributions.
- Masked future positions remain visibly and numerically excluded.
- Multi-head broken mode still demonstrates lost feature information.

### WP3 - Atlas topology and aligned structural comparison

**Goal:** Promote proven information paths into the source-grounded Model Atlas without breaking
existing course descriptors.

Primary locations:

- `packages/model-atlas/src/schema.ts`
- `packages/model-atlas/src/renderer.ts`
- `packages/model-atlas/src/compare.ts`
- `packages/model-atlas/src/comparison-renderer.ts`
- `packages/validator/src/index.ts`
- `examples/ai-from-first-principles/explorables/model-atlas/*.json`

Deliverables:

- Introduce a versioned normalized Atlas representation only after the WP1 gate passes.
- Continue accepting schema version 1. Parse it into the normalized internal form without changing
  its existing meaning, inventing edges from stage order, or replacing its current neutral row and
  numeric comparison.
- If the promotion gate passes, keep graph, trace, resource-snapshot, comparison, and rendering
  contracts inside `@explorables/model-atlas`. Course code continues to own source interpretation
  and exact calculations.
- Add bounded, inert connections with stable IDs, endpoint stage IDs, typed kind, explanation,
  evidence label, and reviewed source IDs.
- Add only the hierarchy needed for meaningful repeated-block disclosure: explicit parent/group
  relationships and honest repeat counts. Do not enumerate every repeated object.
- Add explicit scoped topology coverage (`complete`, `partial`, or `undisclosed`) so unmatched
  structure can be interpreted without guessing.
- Add a trace-v2 union with ordered steps, named shaped tensors, active stage/connection IDs, and
  optional explicitly aligned baseline/variant IDs. Continue accepting the existing trace shape.
- Promote the proven replay controller so buttons, stage selection, semantic outline, tensor table,
  comparison, and graphics all derive from one selection state.
- Add inert resource snapshots with named assumptions, values, units, lens, status, derivation text,
  evidence, and sources. Descriptors and snapshots contain no callbacks or arbitrary formulas.
- Validate unique IDs, endpoints, group-parent cycles, source references, evidence compatibility,
  comparison-key uniqueness, tensor shape/value products, trace ordering, topology coverage,
  descriptor/trace cross-references, and combined edge/scene budgets.
- Render stage-kind-specific nodes, visible typed connections, residual skips, and compact `xN`
  labels. Keep the 3D renderer as progressive enhancement rather than the only topology view.
- Surface complete source references and revisions in the inspector.
- Align models only through explicit author-supplied comparison keys.
- Extend comparison results with text-visible states:
  - same path;
  - changed disclosed property;
  - added;
  - removed;
  - absent;
  - not applicable;
  - undisclosed; and
  - pending source freeze.
- Report `added` or `removed` only when both descriptors declare complete coverage for the same
  scope. Under partial coverage, use an explicit nondisclosure state rather than making an
  architecture claim.
- Add a synchronized GPT-1/GPT-2/GPT-3/GPT-4 structural comparison. GPT-4 retains an explicit
  undisclosed interior; no topology is inferred.
- Keep exact tensor values limited to the executable teaching model.

Exit criteria:

- Version-1 fixtures and external courses remain valid.
- Version-1 descriptors render without inferred connections, and existing Guided integrations keep
  receiving their current `parameter-changed` event. Any `trace-step-changed` event is additive.
- The GPT lineage comparison distinguishes scale from topology and nondisclosure without relying
  on colour.
- Candidate model-family descriptors still omit unfrozen numerical topology.
- Bundle, scene-object, and instance budgets remain enforced.

### WP4 - KV-cache work and memory lenses

**Goal:** Make the existing cache lesson transferable to MHA, GQA, and MQA without pretending to
measure production hardware.

Primary locations:

- `examples/ai-from-first-principles/explorables/kv-cache/`
- `examples/ai-from-first-principles/lessons/11-autoregressive-inference-kv-caching.md`

Deliverables:

- Add native `Trace`, `Work`, and `Memory` lens controls over one shared deterministic scenario.
- Add bounded controls for batch, layers, query heads, KV heads, head width, sequence length, and
  bytes per stored value.
- Keep prompt-prefill and decode steps visually distinct.
- Show K and V storage separately, the complete formula, substituted values, units, and result.
- Distinguish:
  - exact teaching-model projection counts;
  - exact formula results under learner assumptions; and
  - values that are intentionally not claimed, including latency and real device memory.
- Preserve cached/uncached output equivalence as the correctness invariant.
- Explain MHA, GQA, and MQA as different query-head/KV-head relationships without claiming that
  cache reduction alone predicts model quality or latency.
- Produce lens snapshots from tested course calculations or committed deterministic fixtures; do
  not store executable formula strings or callbacks in an Atlas descriptor.

Exit criteria:

- Boundary tests cover one and many KV heads, invalid divisibility, multiple byte widths, empty or
  minimal prompts, and the maximum permitted sequence.
- A learner can explain which variables make cache memory grow and why dropping history is a model
  change rather than an optimization.

### WP5 - Prose-to-stage focus gate

**Goal:** Connect ordinary lesson prose to the exact visual evidence without creating another
lesson language.

Stage A - required local pilot:

- Keep focus controls inside the Transformer/Atlas iframe.
- Focus the native stage control first, then synchronize visual highlight, inspector, provenance,
  and tensor row.
- Verify keyboard focus, scroll behaviour, reduced motion, and narrow layouts.

Stage B - conditional host integration:

Proceed only if Stage A playtesting shows that prose-to-stage focus materially improves the lesson.

- Define an ordinary Markdown-link convention that targets an existing lesson, explorable instance,
  and bounded stable focus ID. Do not add a directive.
- Validate first-party target IDs at build time where the referenced configuration is statically
  available.
- Add an optional, additive `focus(targetId)` explorable-handle capability and a strictly validated,
  instance-scoped parent-to-iframe focus message.
- Queue focus until the target iframe is ready, move browser focus predictably, and expose failure
  as ordinary text rather than silently doing nothing.
- Reject wrong source/instance pairs, unknown commands and targets, malformed IDs, selectors,
  executable payloads, and oversized messages at both ends of the protocol.
- Keep all permissions and CSP unchanged.

Exit criteria:

- A lesson link can focus the requested semantic stage with keyboard focus intact.
- Invalid lesson, instance, and stage targets fail safely and produce actionable validation or
  runtime diagnostics.
- Courses and explorables that do not implement focus behave exactly as before.

### WP6 - Frontier-course adoption contract

**Goal:** Reuse proven primitives in the right course layer without duplicating generic research
methods across model-family courses.

#### Open Frontier Models: Shared Techniques

The shared course owns:

- claim/source/artifact evidence maps;
- raw-to-canonical configuration mapping;
- aligned source-grounded configuration differences;
- total/active parameter, weight-memory, KV/state-memory, compute, and communication lenses;
- assumption controls and formula provenance;
- confounder detection for controlled comparisons; and
- reported/reproduced/inferred claim labelling.

#### Model-family courses

Model-family courses supply pinned descriptors, deterministic mechanism traces, failure cases, and
interpretation:

- **DeepSeek:** V3/R1-to-V4 lineage, hybrid attention, constrained residual paths, and routed
  experts.
- **Kimi:** recurrent-state replay, DeltaNet/KDA updates, hybrid schedules, and information
  overwrite/retrieval.
- **Qwen:** aligned dense/MoE structure, total versus active work, and routed paths.
- **MiniMax:** editable efficient/full-attention schedules with synchronized cost and recall.
- **GLM:** IndexShare groups, reused top-k indices, KV/index paths, and speculative-serving
  timelines.

Rules:

- Planned production-family views remain architecture-only unless exact values come from tested
  course code or committed deterministic fixtures.
- Timelines, matrices, distributions, optimizer paths, and tool state machines remain purpose-built
  2D interactions; not every lesson uses the Atlas.
- Update course briefs as primitives stabilize, but do not make planned courses appear runnable.

Exit criteria:

- The shared/family ownership boundary is documented in the roadmap and course briefs.
- No model-family brief duplicates the shared accounting or evidence methodology.

### WP7 - Hardening, documentation, and release verification

Deliverables:

- Unit tests for topology parsing, trace ordering, calculations, comparison states, focus IDs, and
  cleanup.
- Golden tests proving replay matches `forward()`, repeated runs are identical, tensor shapes are
  valid, and baseline/variant alignment finds the first actual divergence.
- Interaction tests for every replay control and broken path.
- Browser tests for normal and narrow desktop widths, light/dark themes, keyboard-only use,
  reduced motion, and WebGL failure/context loss.
- Frame-level accessibility checks for the modified first-party explorables.
- Keyboard-only focus assertions after replay, model, diff, and prose selections, with concise live
  announcements that do not repeatedly announce whole tables.
- Stable visual regression coverage for the 2D semantic topology; do not depend on
  platform-sensitive WebGL pixels for the only assertion.
- Sandbox tests proving no CSP, iframe permission, message-origin, or bundle-budget regression.
- Repeated switch/destroy and maximum-budget stress tests covering renderer, geometry, material,
  observer, listener, frame, and timer cleanup.
- Validator fixtures for malformed endpoints, unknown sources, duplicate IDs, excessive graph
  budgets, bad focus links, and invalid disclosure states.
- Update the PRD, relevant ADRs, architecture, authoring guide, course roadmap, implementation
  status, changelog, source register where needed, and tutor prompts.
- Update lesson prose, objectives, predictions, checkpoints, text fallbacks, and explanation prompts
  only where the interaction changes the learner task.
- Decide and document the course version. Preserve stable lesson/checkpoint IDs and never claim to
  migrate browser progress across versions unless a tested migration is implemented.
- Run the complete supported-toolchain and clean-checkout verification.

Exit criteria:

- All affected course exercises and deterministic model tests pass.
- Both example courses validate and build.
- The full repository check, build, browser, accessibility, sandbox, and site suites pass under the
  default Node 24/pnpm 11 toolchain and the Node 22/pnpm 10 compatibility floor.
- A clean clone reproduces the same results without network access after dependency installation.

## 6. Verification matrix

| Area | Required evidence |
| --- | --- |
| Exact replay | Named shaped tensors, stable ordered IDs, golden forward/back values, repeat determinism, restart, bounds, no completion on render |
| Topology | Endpoint/source integrity, typed text alternative, selected path synchronization, bounded density |
| Broken modes | First divergence identified, correct path still inspectable, numerical invariant fails for the stated reason |
| Attention | Selected contribution reconstructs the output; causal future contribution is zero |
| Atlas comparison | Explicit alignment only; complete-coverage gate for added/removed; same/changed/disclosure states available in text |
| Resource lenses | Formula substitution and units tested; exact/estimate labels visible; no latency claim |
| Focus | Valid targets focus native controls; invalid targets fail safely; optional capability is backward-compatible |
| Accessibility | In-iframe axe, keyboard order, visible focus, native controls, concise aria-live updates, reduced motion, 720 px/320 px layouts, no colour-only state |
| Security | Inert bounded data, no remote requests, unchanged CSP/sandbox, source/instance/target validation, bounded messages |
| Lifecycle | Resize, rerender, mode switch, context loss, unmount, listener removal, and Three.js disposal |
| Reproducibility | Frozen fixtures, deterministic output, bundle budgets, supported toolchains, clean checkout |

## 7. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| A generic viewer displaces the course | Require a prediction, manipulation, evidence check, implementation, and explanation around every new interaction |
| Schema scope expands before the task is proven | Keep WP1 course-local and gate schema version 2 on its learner outcome |
| Lesson 11 becomes more crowded | Enhance the existing cache lab and Atlas; add no fourth large explorable |
| A diagram looks precise but exceeds its evidence | Require evidence/source IDs on connections and explicit disclosure states |
| Cost estimates are mistaken for measurements | Show formulas, assumptions, units, provenance class, and an explicit not-measured statement |
| Structural alignment invents similarity | Require author-supplied stable comparison keys; never fuzzy-match module names |
| Replay creates motion or keyboard barriers | Default paused, supply direct-step buttons/list, respect reduced motion, keep complete tables |
| Canvas or WebGL fails | Keep native semantic paths and exact tables complete; treat graphics as replaceable enhancement |
| Host focus widens the sandbox protocol | Gate it, keep it additive and instance-scoped, validate bounded IDs, and add no permission |
| Independent views drift to different selections | Use one pure selection reducer and derive every semantic and graphical view from it |
| Missing source coverage looks like removal | Permit added/removed only across matching complete-coverage scopes; otherwise show nondisclosure |
| Dynamic rerenders lose focus or over-announce | Preserve the active native control, test focus after every transition, and use one concise live status |
| Course progress is silently invalidated | Preserve IDs and explicitly decide/document any course-version transition |
| Bundle size or rendering density grows | Enforce descriptor, edge, object, instance, and compressed-bundle budgets in CI |

## 8. Definition of done

This milestone is complete only when all of the following are true:

1. A learner can step through the tiny Transformer's exact path and correctly identify the first
   cross-token mixing stage.
2. The same learner can enable the broken residual path and identify the first divergent step.
3. Backpropagation visibly replays the missing local derivative and still agrees with finite
   differences in the correct mode.
4. One selected attention cell can be traced through value mixing and reconstructed numerically.
5. The Atlas shows source-grounded typed connections, repetition, provenance, and a complete
   semantic alternative.
6. GPT-lineage comparison distinguishes scaling, structural change, and undisclosed information.
7. The KV-cache lab explains work and storage growth under explicit assumptions while preserving
   cached/uncached equivalence.
8. Local claim-focus controls work accessibly; host-level Markdown focus is either implemented and
   verified or explicitly deferred with the gate result recorded.
9. No production weights, runtime downloads, accounts, backend, analytics, new directive, or wider
   iframe permission has been introduced.
10. Documentation, status, tests, supported-toolchain CI, and clean-checkout verification are
    complete.

Required release gates:

- `pnpm check`
- `pnpm course:test`
- `pnpm build`
- `pnpm test:browser`
- `pnpm site:test`
- validation of both example courses and a clean-checkout build
- Node 24/pnpm 11 and Node 22.22.2+/pnpm 10.26.0 compatibility runs

## 9. Coherent implementation increments

Implement and review the work in these independently verifiable increments:

1. **Plan and baseline:** this plan, acceptance fixtures, decision gate, and baseline evidence.
2. **Transformer replay:** WP1 with exact model/unit/browser tests.
3. **Replay transfer:** Backpropagation and attention drill-down, followed by the helper-promotion
   decision.
4. **Atlas topology:** versioned parsing, connections, semantic path, provenance, and validator
   coverage.
5. **Structural comparison:** explicit alignment and GPT-lineage learner task.
6. **KV lenses:** exact work/memory formulas, MHA/GQA/MQA controls, and lesson update.
7. **Focus gate:** local focus pilot, then optional host integration if justified.
8. **Course-family handoff and hardening:** briefs, docs, accessibility, security, browser suites,
   toolchain matrix, and clean clone.

Do not combine a failing increment with later scope. Each increment must leave the current course
valid, buildable, accessible, and usable from a clean checkout.
