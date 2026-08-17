# Inside DeepSeek course brief

Status: accepted concept; refreshed for DeepSeek V4; source freeze required before implementation Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models: Shared Techniques` v0.1 Candidate releases: DeepSeek V4 Pro and Flash, with DeepSeek V3 and R1 retained as lineage sources

## Promise

Trace selected techniques from DeepSeek V3 and R1 into the pinned DeepSeek V4 Pro/Flash family, compare them with the foundation Transformer, and explain the architectural, optimisation, systems, and post-training trade-offs without claiming to reproduce full-model capability.

## Learning outcomes

After completing the course, a learner can:

- reconcile V4 Pro/Flash base and post-trained artifacts and account for total versus active parameters;
- explain what V4 retains from V3/R1 and what its hybrid attention replaces;
- implement toy Compressed Sparse Attention and Heavily Compressed Attention paths and measure cache, work, recall, and approximation error;
- implement a constrained multi-stream residual path inspired by Manifold-Constrained Hyper-Connections and diagnose unstable mixing;
- implement deterministic learned and token-hash expert routing and diagnose imbalance;
- compare AdamW with a small Muon-style matrix update and reason about low-precision range, scaling, accumulation, and FP4/FP8 boundaries;
- separate domain-expert training, verifiable rewards, on-policy distillation, reasoning effort, and evaluation harness effects;
- distinguish the lab's reported result from the course's reconstruction.

## Provisional curriculum

1. **Reading DeepSeek V4 in context** — V3/R1 lineage; V4 Pro/Flash and base/post-trained boundaries; configurations, licences, reasoning modes, reported claims, and missing reproduction inputs.
2. **Hybrid long-context attention** — CSA compression and sparse selection, HCA consolidation, local windows, interleaving, cache/work accounting, and approximation failures.
3. **Manifold-constrained residual paths** — expanded residual streams, constrained mixing, signal propagation, expressivity, and instability.
4. **Sparse experts and routing bootstrap** — routed/shared experts, learned top-k routing, token-ID hash routing in early layers, active parameters, capacity, imbalance, and dropped tokens.
5. **Muon, low precision, and training systems** — matrix updates, Newton-Schulz approximation, scaling and accumulation, FP4/FP8 boundaries, pipeline stages, expert dispatch, and overlap.
6. **Post-training and consolidation** — domain-specific SFT/RL experts, verifiable rewards, GRPO, on-policy distillation into one model, reward exploits, and evidence limits.
7. **Reasoning and long-context evaluation** — effort budgets, context length, model-versus-harness controls, multiple trials, resource accounting, and defensible V4 Pro/Flash comparisons.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | V3/R1-to-V4 artifact and parameter map | Normalise pinned Pro/Flash artifacts |
| Hybrid attention | Local, CSA, and HCA cache/work/recall comparison | Implement compressed sparse selection |
| Residual paths | Mixing matrix and signal-propagation trace | Enforce a stable constrained mixer |
| Sparse experts | Learned-versus-hash router utilisation trace | Implement deterministic routing |
| Optimisation and systems | AdamW/Muon update and precision/schedule simulator | Implement a bounded matrix update |
| Post-training | Domain-expert and student-policy trace | Implement deterministic policy consolidation |
| Evaluation | Context/effort/harness comparison | Validate a claim-aligned experiment manifest |

## Capstone

Extend the foundation Transformer with a toy hybrid long-context attention path, a constrained residual mixer, and sparse experts. Compare each change independently and together against the unchanged baseline. Report cache memory, active compute, approximation error, routing distribution, optimisation behaviour, and the limits of the comparison using the shared experiment manifest.

## Boundary

The shared core owns artifact reading, accounting, and experiment method. This course owns DeepSeek-specific source interpretation, the V3/R1-to-V4 lineage, and the combination of selected techniques. It does not turn the V4 report's benchmark table into reproduced evidence. General sparse-attention, residual, optimiser, or MoE utilities may later be reused by other courses, but their prose and conclusions remain model-specific.

## Acceptance criteria

- Exact V3, R1, and V4 report revisions, model-card commits, configurations, inference code, and licences are frozen, including both V4 Pro/Flash and base/post-trained boundaries.
- Every source claim is labelled reported, reproduced, or inferred.
- The hybrid attention, residual, and sparse paths modify the versioned foundation artifact.
- Model and visual tests include compression and selection error, routing determinism, overload, unstable residual mixing, numerical failure, reward-exploit, and harness-confound cases.
- The course and capstone pass clean-checkout validation without a GPU, checkpoint, account, API, or network service.
