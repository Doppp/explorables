# Inside Kimi course brief

Status: accepted concept; source freeze required before implementation
Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models:
Shared Techniques` v0.1
Candidate releases: Kimi K2, Kimi Linear, and Kimi K3

## Promise

Reconstruct the language-model architecture lineage from the foundation
Transformer through selected Kimi K2, Kimi Linear, and Kimi K3 mechanisms.
Measure each change against the common baseline instead of treating Kimi K3 as
an indivisible production system.

## Learning outcomes

After completing the course, a learner can:

- reconcile the public artifacts and configurations for the pinned releases;
- account for total and active parameters in a sparse Kimi case study;
- compare AdamW with a Muon-inspired matrix update on conditioned problems;
- explain why fixed-size linear-attention state creates interference and needs
  an update or eviction policy;
- implement deterministic linear, delta-style, gated, and channel-wise
  attention-state updates;
- explain how chunkwise formulations trade arithmetic for parallel hardware
  utilisation without confusing FLOPs with wall-clock time;
- trace how Kimi K3 combines KDA, gated MLA, Stable LatentMoE, SiTU-GLU, and
  Attention Residuals;
- compare full and efficient attention across sequence length and recall tasks;
- state which reported Kimi claims the toy experiments cannot test.

## Provisional curriculum

1. **Reading the Kimi lineage** — Kimi K2, Kimi Linear, and Kimi K3 artifact
   boundaries, configurations, licences, architectural claims, and the limits
   of comparisons across releases.
2. **Sparse and latent MoE anatomy** — expert banks, routing, total versus
   active parameters, shared experts, latent expert computation, SiTU-GLU,
   capacity, and utilisation.
3. **Matrix-aware optimisation** — momentum matrices, conditioning,
   orthogonalisation intuition, update norms, clipping, and numerical failure.
4. **Linear attention as fixed-size memory** — reassociation, recurrent state,
   retrieval, interference, normalization, sequence length, and causal
   invariants.
5. **DeltaNet and chunkwise parallelism** — selective replacement, delta-rule
   state updates, sequential dependencies, chunkwise prefill, and the
   distinction between operation count and hardware utilisation.
6. **Gating and Kimi Delta Attention** — global decay, selective replacement,
   channel-wise decay, memory capacity, corruption, and adversarial recall.
7. **Kimi K3 hybrid architecture** — KDA and periodic gated MLA, Stable
   LatentMoE, Attention Residuals, residual retrieval, quantisation boundaries,
   and how the pieces address different information-loss or scaling limits.
8. **Controlled architecture comparison** — full, recurrent, and hybrid paths
   across memory, work, recall, interference, stability, and latency proxies.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | Evidence and sparse-parameter map | Normalise the pinned configs |
| Sparse and latent MoE | Expert utilisation and active-compute trace | Route a deterministic batch through shared and selected experts |
| Optimisation | AdamW versus matrix-aware update paths | Implement a Muon-inspired update |
| Linear attention | Fixed-state write/read and interference laboratory | Implement normalized recurrent state |
| DeltaNet parallelism | Sequential and chunkwise state trace | Implement delta updates and a checked chunkwise form |
| KDA gating | Scalar versus channel-wise memory decay | Implement deterministic gated state updates |
| Kimi K3 anatomy | KDA/MLA/MoE/AttnRes architecture and information-path map | Assemble a toy hybrid block from tested mechanisms |
| Comparison | Cost/recall frontier across sequence lengths | Build a controlled full/recurrent/hybrid comparison |

## Capstone

Modify the foundation Transformer with one sparse-routing change and one
efficient-attention or matrix-update change, then assemble a small Kimi
K3-inspired hybrid using only mechanisms implemented in the course. Measure
changes independently and together on deterministic sequence tasks, then
report cost, error, stability, memory, and non-reproduced production claims.

## Boundary

The course does not teach generic research manifests or baseline accounting;
those come from the shared core. It does not inherit conclusions from the
DeepSeek course merely because both releases use sparse experts.

Kimi K3's native multimodality, million-token production behavior,
quantisation-aware training stack, training scale, inference kernels, agent
harness, and reported benchmark results are release artifacts to inspect, not
capabilities this local toy reconstruction claims to reproduce. The first
course version focuses on the language backbone and the architectural
mechanisms that can be tested without weights, GPUs, APIs, or hosted services.

## Acceptance criteria

- Exact Kimi reports, commits, model cards, and licences are frozen, including
  manual resolution of any repository or weight-licence ambiguity.
- Kimi K3 is a required pinned release, and its KDA, gated MLA, Stable
  LatentMoE, SiTU-GLU, and AttnRes claims map to explicit lessons or documented
  scope boundaries.
- Optimiser and recurrent-attention math have finite-difference or equivalent
  numerical checks.
- Sequential and chunkwise delta-style implementations agree within documented
  tolerances on deterministic fixtures.
- Comparisons control sequence, dimensions, precision, and measurement units.
- Failure modes cover conditioning, unstable updates, state corruption,
  sequence recall, memory interference, routing collapse, residual dilution,
  and misleading cost comparisons.
- The course passes all clean-checkout checks without production weights,
  training hardware, accounts, APIs, or network services.
