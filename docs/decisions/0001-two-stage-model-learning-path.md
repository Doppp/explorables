# ADR 0001: Use a two-stage model learning path

Status: superseded by ADR 0002 Date: 28 July 2026

## Context

The existing `AI from First Principles` v0.1 course is a six-hour vertical slice. It teaches scalar optimisation, basic backpropagation, BPE, simplified self-attention, sampling, and evaluation leakage.

An advanced course about techniques documented by DeepSeek, Kimi, Qwen, MiniMax, and GLM would require matrix operations, complete Transformer blocks, next-token training, KV caching, numerical precision, and training systems. Those prerequisites are not yet taught by the existing course.

Organising the advanced material as one course per lab would also duplicate fundamentals, age quickly, and encourage brand-centred rather than mechanism-centred comparisons.

## Decision

Create a two-stage learning path:

1. expand `AI from First Principles` so the learner builds, trains, runs, and evaluates a small Transformer;
2. create `Open Frontier Models`, organised around transferable mechanisms and using named models as pinned case studies.

The advanced course must modify the foundation capstone and map every assumed prerequisite to a completed foundation lesson. Model-specific claims use primary sources and are labelled `reported`, `reproduced`, or `inferred`.

## Consequences

- The frontier course cannot reach release before the foundation expansion it depends on.
- The curriculum has a longer path, but avoids an unexplained jump from scalar examples to frontier training systems.
- Lessons remain durable when individual model families change.
- Research and licence provenance become required course data.
- Required exercises remain small and CPU-friendly; production checkpoints and GPUs are optional and outside the completion path.
- Implementation is split across multiple pull requests rather than one course megadiff.

## Rejected alternatives

### Start the frontier course from the current six lessons

Rejected because it silently assumes core Transformer, training, numerical, and systems concepts.

### Put all missing foundations in the frontier course

Rejected because it duplicates the purpose of `AI from First Principles` and weakens the claim that the courses form a progression.

### Create one independent course per lab

Rejected because it repeats mechanisms, becomes stale quickly, and makes technical comparisons secondary to model branding.
