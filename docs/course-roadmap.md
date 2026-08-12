# Model-learning course roadmap

Status: accepted; foundation complete and frontier family planned
Planning date: 28 July 2026

## Purpose

`AI from First Principles` is the common foundation for a family of advanced
courses about open-weight frontier-model research:

```text
AI from First Principles
Build, train, run, and evaluate a small Transformer
                         |
                         v
Open Frontier Models: Shared Techniques
Read artifacts, compare systems, and reproduce claims
             /-----------+-----------+-----------+-----------\
            v            v           v           v            v
   Inside DeepSeek  Inside Kimi  Inside Qwen  Inside MiniMax  Inside GLM
```

The shared core teaches research and comparison methods once. Each model course
then reconstructs techniques associated with one lab and pinned model release.
This makes the labs first-class subjects without copying prerequisite material
or turning model branding into the organising principle for shared concepts.

## Course family

### 1. AI from First Principles v0.2

Status: implementation and automated verification complete.

By the end, a learner can explain, implement, train, run, and evaluate a small
autoregressive Transformer.

Detailed scope:
[courses/ai-from-first-principles-v0.2.md](courses/ai-from-first-principles-v0.2.md).

### 2. Open Frontier Models: Shared Techniques v0.1

Prerequisite: `AI from First Principles` v0.2.

By the end, a learner can inspect open-weight model artifacts, normalise
configurations, account for parameters and costs, run controlled comparisons,
and produce a reproducible claim dossier. Named models appear as examples, but
their distinctive algorithms are taught in the lab-specific courses.

Detailed scope:
[courses/open-frontier-models.md](courses/open-frontier-models.md).

### 3. Inside DeepSeek v0.1

Prerequisites: the foundation course and shared frontier core.

Reconstruct selected DeepSeek architecture, routing, numerical, systems, and
reasoning techniques at small scale.

Detailed scope: [courses/inside-deepseek.md](courses/inside-deepseek.md).

### 4. Inside Kimi v0.1

Prerequisites: the foundation course and shared frontier core.

Reconstruct selected Kimi K2, Kimi Linear, and Kimi K3 sparse-model,
matrix-optimisation, recurrent-attention, and hybrid-architecture techniques at
small scale.

Detailed scope: [courses/inside-kimi.md](courses/inside-kimi.md).

### 5. Inside Qwen v0.1

Prerequisites: the foundation course and shared frontier core.

Study a pinned Qwen family through dense/MoE comparisons, reasoning controls,
and reproducible adaptation experiments.

Detailed scope: [courses/inside-qwen.md](courses/inside-qwen.md).

### 6. Inside MiniMax v0.1

Prerequisites: the foundation course and shared frontier core.

Reconstruct selected MiniMax hybrid-attention, long-context, and reasoning
techniques at small scale.

Detailed scope: [courses/inside-minimax.md](courses/inside-minimax.md).

### 7. Inside GLM v0.1

Prerequisites: the foundation course and shared frontier core.

Reconstruct selected GLM sparse-model, hybrid-reasoning, and agentic-evaluation
techniques at small scale.

Detailed scope: [courses/inside-glm.md](courses/inside-glm.md).

## Planned course packages

| Course ID | Working directory | Planned lessons |
| --- | --- | ---: |
| `ai-from-first-principles` | `examples/ai-from-first-principles` | 13 complete |
| `open-frontier-models` | `examples/open-frontier-models` | 5 |
| `inside-deepseek` | `examples/inside-deepseek` | 6 |
| `inside-kimi` | `examples/inside-kimi` | 8 |
| `inside-qwen` | `examples/inside-qwen` | 5 |
| `inside-minimax` | `examples/inside-minimax` | 5 |
| `inside-glm` | `examples/inside-glm` | 5 |

These are separate course packages with separate `COURSE.md` files. They share
the runtime and may reuse stable tested utilities; they do not share one lesson
navigation tree or release number.

## Dependency rules

- Every frontier course starts from the versioned tiny Transformer produced by
  `AI from First Principles`.
- Every lab-specific course may assume the shared core's artifact-reading,
  accounting, experiment-manifest, and claim-labelling skills.
- A model course may not silently assume a mechanism taught only by another
  model course. It must teach the mechanism locally or declare that course as
  an optional extension.
- Shared mechanisms are linked rather than copied. Lab courses concentrate on
  how a pinned release combines, modifies, or motivates them.
- Each course owns its lessons, exercises, capstone, source manifest, and
  version. Learners may take model courses independently after the two common
  prerequisites.

## Shared constraints

- Keep plain Markdown and the existing `explorable` and `exercise` directives.
- Require no account, API, backend, network access, GPU, or model-weight
  download for completion.
- Run course JavaScript only in the existing sandboxed iframe boundary.
- Use deterministic toy models, seeded randomness, fixed datasets, explicit
  tolerances, and stable tie-breaking.
- Preserve the predict, manipulate, implement, debug, explain, and transfer
  teaching loop.
- Use primary research artifacts and immutable source provenance.
- Say `open-weight` unless code, weights, data, and licences support a stronger
  claim.
- Label technical claims as `reported`, `reproduced`, or `inferred`.
- Never present a toy reconstruction as reproduction of full-model capability.

## Delivery sequence

### Milestone 0 — runtime and foundation

Status: complete.

- Deliver the v0.1 runtime and authoring format.
- Complete the thirteen-lesson foundation course and tiny Transformer.
- Verify deterministic training, generation, caching, evaluation, sandboxing,
  accessibility, and clean builds.

### Milestone 1 — guided course delivery

- Add reusable opt-in checkpoints, ordered navigation, explicit skip/Explore
  controls, local resume state, and tutor focus rules.
- Apply the complete guided loop to all thirteen foundation lessons.
- Preserve unrestricted navigation for existing courses that do not opt in.

### Milestone 2 — course-family and source freeze

- Accept the shared-core and model-course boundaries.
- Map every advanced prerequisite to the foundation or shared core.
- Select the exact releases used by the first implementation increments.
- Pin reports, repositories, commits, model cards, and evaluation protocols.
- Complete separate code, weight, data, and figure licence review.
- Create one immutable source manifest per course before its first technical
  lesson is implemented.

### Milestone 3 — shared frontier core

- Implement artifact and licence reading, configuration normalisation,
  parameter/cost accounting, controlled comparison, and research reproduction.
- Produce a machine-checkable experiment manifest and model dossier.
- Establish the common baseline and reporting format used by every model
  course.

### Milestone 4 — Inside DeepSeek

- Implement the first complete lab-specific course.
- Use pinned DeepSeek releases to teach selected attention, expert-routing,
  numerical/training-system, and reasoning techniques.
- Complete a DeepSeek-specific controlled-reconstruction capstone.
- Use this course to validate the boundary between shared and lab-specific
  material before implementing the remaining courses.

### Milestone 5 — Inside Kimi

- Add sparse-model and matrix-aware optimisation experiments.
- Trace the pinned lineage from Kimi Linear's fixed-state attention through
  delta updates, chunkwise parallelism, gating, and KDA.
- Add a Kimi K3 architecture lesson covering its hybrid KDA/gated-MLA pattern,
  Stable LatentMoE, SiTU-GLU, and Attention Residuals.
- Separate locally reconstructed mechanisms from native multimodality,
  quantisation-aware training, production kernels, scale, and benchmark claims.
- Complete a Kimi-specific controlled-reconstruction capstone.

### Milestone 6 — Inside Qwen

- Compare pinned dense and sparse family members without conflating size,
  active parameters, or evaluation protocol.
- Teach documented reasoning controls and a reproducible adaptation or
  inference experiment.
- Complete a Qwen-specific controlled-reconstruction capstone.

### Milestone 7 — Inside MiniMax

- Add hybrid-attention and long-context cost/recall experiments.
- Teach the documented reasoning and training choices supported by the pinned
  source set.
- Complete a MiniMax-specific controlled-reconstruction capstone.

### Milestone 8 — Inside GLM

- Add sparse architecture and hybrid-reasoning experiments.
- Separate model capability from agent scaffolding and tool-environment
  evaluation.
- Complete a GLM-specific controlled-reconstruction capstone.

### Milestone 9 — external validation and releases

- Conduct technical, licence, accessibility, and clean-checkout reviews.
- Ask at least five target learners to complete one foundation lesson, one
  shared-core lesson, and one model-specific lesson.
- Record setup failures, transition gaps, stale-source risks, and misleading
  interactions.
- Give each course an explicit maintenance policy.
- Tag versioned course releases only after its evidence is complete.

## Pull-request sequence

Completed foundation increments:

1. `course/ai-foundations-math`
2. `course/ai-foundations-transformer`
3. `course/ai-foundations-inference`

Planned frontier increments:

4. `feature/guided-course-mode`: runtime guidance and foundation checkpoints.
5. `course/open-frontier-core`: shared research and comparison foundation.
6. `course/inside-deepseek-architecture`: anatomy, latent attention, and sparse
   experts.
7. `course/inside-deepseek-training`: routing, numerical systems, reasoning,
   and capstone.
8. `course/inside-kimi`: sparse models, matrix-aware optimisation, efficient
   attention, and capstone.
9. `course/inside-qwen`: family comparison, reasoning controls, adaptation,
   and capstone.
10. `course/inside-minimax`: hybrid attention, long context, reasoning, and
   capstone.
10. `course/inside-glm`: sparse models, agentic evaluation, reasoning, and
    capstone.
11. `course/frontier-family-validation`: cross-course checks, learner evidence,
    maintenance policies, and release preparation.

Each branch starts from updated `master` after its dependencies merge. A course
may be split into more pull requests when its source freeze reveals a larger
coherent scope; no PR should mix unrelated lab courses.

## Promotion of shared components

Interactive primitives begin course-local. A primitive may move into a shared
package only after at least three real lesson uses demonstrate a stable API.
The component gallery should cover promoted components, accessibility states,
and failure states.

Shared prose is not copied between courses. Courses link to prerequisites and
reuse tested model utilities only when doing so preserves an explicit,
versioned educational contract.

## Initiative definition of done

- The foundation course produces the working baseline used by every advanced
  course.
- The shared core teaches every cross-cutting research and comparison skill
  assumed by model courses.
- DeepSeek, Kimi, Qwen, MiniMax, and GLM each have a distinct runnable course,
  pinned source manifest, exercises, and controlled-reconstruction capstone.
- Every lesson has an explorable, exercise, intentional failure, explanation
  prompt, text alternative, and primary-source references where applicable.
- All required work runs locally without accounts, APIs, GPUs, or weight
  downloads.
- Every course validates, tests, and builds from a clean checkout under Node 24
  and pnpm 11.
- Codex and Claude Code Desktop tutor every course through the same
  host-neutral format.
- Learner evidence shows that transitions from foundation to shared core to a
  model-specific course are understandable.
- Every course has a versioned release and explicit source/maintenance policy.
