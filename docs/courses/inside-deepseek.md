# Inside DeepSeek course brief

Status: accepted concept; source freeze required before implementation
Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models:
Shared Techniques` v0.1
Candidate releases: DeepSeek V3 and DeepSeek R1

## Promise

Reconstruct selected techniques documented in pinned DeepSeek releases, compare
them with the foundation Transformer, and explain the architectural, systems,
and post-training trade-offs without claiming to reproduce full-model
capability.

## Learning outcomes

After completing the course, a learner can:

- trace a pinned DeepSeek configuration from total to active parameters;
- implement and measure a toy latent-attention path;
- implement deterministic sparse expert routing and diagnose imbalance;
- reason about low-precision range, scaling, accumulation, and outliers;
- simulate pipeline/expert scheduling and communication overlap;
- explain a verifiable-reward reasoning loop and identify reward exploits;
- distinguish the lab's reported result from the course's reconstruction.

## Provisional curriculum

1. **Reading DeepSeek V3 and R1** — artifact map, configuration, licences,
   reported claims, and missing reproduction inputs.
2. **Multi-head Latent Attention** — latent compression, reconstruction,
   positional interaction, cache memory, and output error.
3. **Sparse experts** — routed and shared experts, top-k selection, active
   parameters, capacity, and dropped tokens.
4. **Routing stability** — skew, expert collapse, balancing strategies, and
   deterministic load measurements.
5. **Low precision and training systems** — scaling granularity, accumulation,
   simulated overflow, pipeline stages, expert dispatch, and overlap.
6. **Reasoning post-training** — sampled paths, verifiable rewards, policy
   shifts, reasoning budgets, reward hacking, and evidence limits.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | Normalised V3/R1 artifact and parameter map | Parse the pinned config |
| Latent attention | Cache dimension versus reconstruction error | Implement a latent KV path |
| Sparse experts | Token router and utilisation trace | Implement deterministic top-k routing |
| Routing stability | Skew/capacity stress test | Correct expert overload |
| Precision and systems | Scaling plus pipeline schedule simulator | Block scaling or low-bubble schedule |
| Reasoning | Reward sampled toy paths | Harden a verifiable reward |

## Capstone

Extend the foundation Transformer with toy latent attention and sparse experts.
Compare each change independently and together against the unchanged baseline.
Report cache memory, active compute, routing distribution, output difference,
and the limits of the comparison using the shared experiment manifest.

## Boundary

The shared core owns artifact reading, accounting, and experiment method.
This course owns DeepSeek-specific source interpretation and the combination of
selected techniques. General MLA or MoE utilities may later be reused by other
courses, but their prose and conclusions remain model-specific.

## Acceptance criteria

- Exact V3 and R1 reports, commits, model cards, and licences are frozen.
- Every source claim is labelled reported, reproduced, or inferred.
- The latent and sparse paths modify the versioned foundation artifact.
- Model and visual tests include cache equivalence, routing determinism,
  overload, numerical failure, and reward-exploit cases.
- The course and capstone pass clean-checkout validation without a GPU,
  checkpoint, account, API, or network service.
