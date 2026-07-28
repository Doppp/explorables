# Course roadmap

Status: accepted; implementation in progress
Planning date: 28 July 2026

## Purpose

The next curriculum increment should turn the current six-lesson
`AI from First Principles` vertical slice into the foundation for a second,
advanced course:

```text
AI from First Principles
Build, train, run, and evaluate a small Transformer
                         |
                         v
Open Frontier Models
Reconstruct selected frontier-model techniques at small scale
```

The two courses must form one learning path. The advanced course must name the
foundation artifact it extends and must not silently assume mathematics,
Transformer components, training objectives, or inference systems that the
foundation course does not teach.

## Course promises

### AI from First Principles v0.2

By the end, a learner can explain, implement, train, run, and evaluate a small
autoregressive Transformer. The existing v0.1 lessons remain the validated
vertical slice while the missing foundations are added in independently
reviewable milestones.

Detailed scope: [courses/ai-from-first-principles-v0.2.md](courses/ai-from-first-principles-v0.2.md).

### Open Frontier Models v0.1

By the end, a learner can modify the foundation Transformer with small,
testable versions of techniques documented by open-weight frontier-model
projects, measure their trade-offs, and state what the experiment does and
does not reproduce.

Detailed scope: [courses/open-frontier-models.md](courses/open-frontier-models.md).

## Shared constraints

- Keep plain Markdown and the existing `explorable` and `exercise` directives.
- Require no account, API, backend, network access, GPU, or model-weight
  download.
- Run course JavaScript only in the existing sandboxed iframe boundary.
- Use deterministic toy models, seeded randomness, fixed datasets, explicit
  tolerances, and stable tie-breaking.
- Keep exercise execution deliberate and separate from lesson rendering.
- Preserve the predict, manipulate, implement, debug, and explain teaching
  loop.
- Use primary research artifacts and record immutable source provenance.
- Say `open-weight` unless the code, weights, data, and licences support a
  stronger openness claim.
- Label research claims as `reported`, `reproduced`, or `inferred`.

## Delivery sequence

### Milestone 0 — design and research freeze

- Approve both course promises and the prerequisite map.
- Select the exact model releases used as case studies.
- Complete code- and weight-licence review for selected artifacts.
- Pin papers, repositories, commits, model cards, and evaluation protocols.
- Confirm that no course-format or runtime change is required.

### Milestone 1 — mathematical foundation

- Add vectors, matrices, linear layers, cross-entropy, and optimiser lessons.
- Establish course-local tensor, matrix, probability, and training-chart
  primitives.
- Verify the interaction and accessibility conventions with real lessons.

### Milestone 2 — complete Transformer baseline

- Add embeddings, positional information, multi-head attention, the complete
  Transformer block, and next-token training.
- Add autoregressive inference and KV caching.
- Complete and verify the small Transformer capstone.

### Milestone 3 — frontier architecture vertical slice

- Add model anatomy, Multi-head Latent Attention, sparse Mixture-of-Experts, and
  efficient/hybrid attention.
- Verify that every advanced prerequisite resolves to a foundation lesson and
  artifact.

### Milestone 4 — frontier training and systems

- Add routing stability, matrix-aware optimisation, low precision, and
  parallel training systems.

### Milestone 5 — post-training and research

- Add reasoning post-training, agentic tool use, and research reproduction.
- Complete the comparative frontier-model capstone.

### Milestone 6 — external validation

- Conduct technical, licence, accessibility, and clean-checkout reviews.
- Ask at least five target learners to complete one foundation lesson and one
  frontier lesson.
- Record setup failures, conceptual gaps, and misleading interactions.
- Tag versioned course releases only after the evidence is complete.

## Pull-request sequence

Implementation should not be one large pull request.

1. `course/ai-foundations-math`: mathematical foundation.
2. `course/ai-foundations-transformer`: complete Transformer mechanics.
3. `course/ai-foundations-inference`: inference, evaluation, and capstone.
4. `course/open-frontier-architectures`: first advanced vertical slice.
5. `course/open-frontier-training`: optimisation, precision, and systems.
6. `course/open-frontier-post-training`: reasoning, agents, reproduction, and
   capstone.

Each branch should start from the updated `master` after its dependency merges.
Each pull request must validate independently and leave the applicable course
in a coherent state.

## Promotion of shared components

Interactive primitives begin course-local. A primitive may move into a shared
package only after at least three real lesson uses demonstrate a stable API.
The component gallery should cover promoted components, accessibility states,
and failure states. This avoids creating a speculative visual framework before
the lessons establish what should be shared.

## Initiative definition of done

- Course 1 teaches every prerequisite used by Course 2.
- Course 1 produces a working small Transformer baseline.
- Course 2 modifies that baseline using documented frontier techniques.
- Every lesson has an explorable, exercise, intentional failure, explanation
  prompt, text alternative, and primary-source references where applicable.
- All required work runs locally without accounts, APIs, GPUs, or weight
  downloads.
- Both courses validate, test, and build from a clean checkout under Node 24
  and pnpm 11.
- Codex and Claude Code Desktop tutor both courses through the same
  host-neutral format.
- Learner evidence shows that the transition between courses is understandable.
- Both courses have versioned releases and explicit maintenance policies.
