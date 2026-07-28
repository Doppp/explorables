# Inside Kimi course brief

Status: accepted concept; source freeze required before implementation
Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models:
Shared Techniques` v0.1
Candidate releases: Kimi K2 and Kimi Linear

## Promise

Reconstruct selected sparse-model, matrix-optimisation, and
efficient-attention techniques documented in pinned Kimi releases, then measure
their behavior against the common Transformer baseline.

## Learning outcomes

After completing the course, a learner can:

- reconcile the public artifacts and configurations for the pinned releases;
- account for total and active parameters in a sparse Kimi case study;
- compare AdamW with a Muon-inspired matrix update on conditioned problems;
- implement a deterministic recurrent or delta-style attention-state update;
- compare full and efficient attention across sequence length and recall tasks;
- state which reported Kimi claims the toy experiments cannot test.

## Provisional curriculum

1. **Reading the Kimi releases** — artifact boundaries, configuration,
   licences, sparse-model accounting, and source claims.
2. **Sparse model anatomy** — expert banks, routing, active parameters, shared
   components, capacity, and utilisation.
3. **Matrix-aware optimisation** — momentum matrices, conditioning,
   orthogonalisation intuition, update norms, clipping, and numerical failure.
4. **Linear and delta-style attention** — recurrent state, update and retrieval
   behavior, decay, sequence length, and causal invariants.
5. **Comparing efficient attention** — full versus recurrent paths, memory,
   work, recall, adversarial sequences, and hybrid choices.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | Evidence and sparse-parameter map | Normalise the pinned configs |
| Sparse anatomy | Expert utilisation and active-compute trace | Route a deterministic batch |
| Optimisation | AdamW versus matrix-aware update paths | Implement a Muon-inspired update |
| Linear attention | Step through recurrent attention state | Implement the state update |
| Comparison | Cost/recall frontier across sequence lengths | Build a controlled comparison |

## Capstone

Modify the foundation Transformer with one sparse-routing change and one
efficient-attention or matrix-update change. Measure them independently and
together using a deterministic sequence task, then report cost, error,
stability, and non-reproduced production claims.

## Boundary

The course does not teach generic research manifests or baseline accounting;
those come from the shared core. It does not inherit conclusions from the
DeepSeek course merely because both releases use sparse experts.

## Acceptance criteria

- Exact Kimi reports, commits, model cards, and licences are frozen, including
  manual resolution of any repository or weight-licence ambiguity.
- Optimiser and recurrent-attention math have finite-difference or equivalent
  numerical checks.
- Comparisons control sequence, dimensions, precision, and measurement units.
- Failure modes cover conditioning, unstable updates, state corruption,
  sequence recall, and misleading cost comparisons.
- The course passes all clean-checkout checks without production weights,
  training hardware, accounts, APIs, or network services.
