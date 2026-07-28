# Open Frontier Models course brief

Status: accepted; awaits the foundation prerequisite
Working title: **Open Frontier Models: Inside DeepSeek, Kimi, Qwen, MiniMax,
and GLM**
Prerequisite: `AI from First Principles` v0.2

## Promise

Reconstruct selected architectural, optimisation, and post-training techniques
from open-weight frontier-model research at small scale, measure their
trade-offs against a common Transformer baseline, and evaluate the strength of
the public evidence.

The course is organised around transferable mechanisms. Labs and models are
case studies rather than the permanent lesson taxonomy.

## Learning outcomes

After completing the course, a learner can:

- read a model configuration, model card, licence, repository, and technical
  report critically;
- distinguish total parameters, active parameters, memory cost, compute cost,
  and reported benchmark performance;
- implement toy versions of latent attention, sparse expert routing, hybrid
  attention, matrix-aware optimisation, and block scaling;
- explain the systems constraints behind pipeline and expert parallelism;
- describe the roles of supervised fine-tuning, verifiable rewards, policy
  updates, and inference budgets;
- separate model capability from agent scaffolding;
- reproduce a small claim and state what the experiment cannot establish.

## Curriculum

1. **Reading an open frontier model** — normalise configurations, parameter
   accounting, context, precision, artifact availability, and licences.
2. **Multi-head Latent Attention** — conventional KV-cache costs, latent
   compression, reconstruction, positional interaction, and the
   quality-memory-compute trade-off.
3. **Sparse Mixture-of-Experts** — expert banks, router logits, top-k routing,
   active parameters, capacity, shared experts, and dropped tokens.
4. **Routing stability and load balancing** — expert collapse, balancing
   losses, router bias, capacity factors, and skewed token populations.
5. **Efficient and hybrid attention** — full, sliding-window, recurrent
   linear/delta-style, and hybrid attention under changing sequence lengths.
6. **Optimisation and numerical stability** — AdamW, Muon-inspired matrix
   updates, momentum, update norms, clipping, and conditioning.
7. **Low-precision frontier training** — range, precision, scaling granularity,
   accumulation, outliers, overflow, and underflow.
8. **Training systems and parallelism** — data, tensor, pipeline, and expert
   parallelism; microbatches, bubbles, dispatch, and communication overlap.
9. **Reasoning post-training** — supervised fine-tuning, sampled paths,
   verifiable rewards, outcome/process signals, reward hacking, and reasoning
   budgets.
10. **Agentic models and tool use** — tool representation, environment
    feedback, trajectories, invalid actions, credit assignment, and
    long-horizon evaluation.
11. **Reproducing a frontier claim** — hypothesis, baseline, controlled
    change, measurement, uncertainty, confounders, and limits.

## Explorable plan

| Lesson | Learner-controlled explorable |
| --- | --- |
| Model anatomy | Compare normalised configurations with memory/compute estimates |
| Latent attention | Trade latent dimension against cache size and output error |
| Sparse MoE | Route token batches and inspect utilisation and dropped tokens |
| Routing stability | Stress routers with skew and compare balancing strategies |
| Efficient attention | Compare cost and recall across attention mechanisms |
| Optimisation | Compare update direction and norm on conditioned matrices |
| Low precision | Change scale granularity and inspect quantisation error |
| Parallelism | Schedule simulated devices and expose bubbles/communication |
| Reasoning | Reward sampled toy paths and inspect the policy shift |
| Agentic models | Inspect a model-tool-environment state machine and failures |
| Reproduction | Manipulate experimental assumptions and confounders |

No required explorable loads a production checkpoint, contacts an API, or
claims to reproduce full-model capability.

## Exercises

Exercises remain small, focused, and independently testable:

- normalise heterogeneous model configurations;
- implement a latent KV path;
- implement deterministic top-k expert routing;
- diagnose and correct expert overload;
- implement a recurrent attention-state update;
- implement a Muon-inspired matrix update;
- implement deterministic block scaling;
- create a valid low-bubble pipeline schedule;
- compute a verifiable reward resistant to a deliberate exploit;
- validate a constrained tool-call trajectory;
- produce a machine-checkable experiment manifest.

Each starter fails for one conceptually relevant reason. Reference paths remain
protected by the course tutor policy.

## Capstone

The learner extends the foundation course's tiny Transformer with two selected
frontier techniques and compares each with the unchanged baseline.

The report must include:

- hypothesis and cited source claim;
- pinned baseline and controlled change;
- deterministic measurement procedure;
- results and failure analysis;
- reproducibility instructions;
- code and weight provenance;
- licence notes;
- explicit limits on the conclusion.

## Research integrity

Every technical claim is marked:

- **reported** when it comes from the originating lab;
- **reproduced** when the course recreates it under documented conditions;
- **inferred** when it is our interpretation of public evidence.

Every lesson states its simplifications. Performance claims from incompatible
models, hardware, data, agents, or evaluation protocols are not presented as
direct comparisons.

The candidate source register is
[../research/open-frontier-models-sources.md](../research/open-frontier-models-sources.md).

## Acceptance criteria

- Every prerequisite maps to a completed foundation lesson and artifact.
- All lessons contain prediction, manipulation, implementation, debugging,
  explanation, and transfer.
- Mathematical models are tested separately from their visual interfaces.
- Seeded runs are deterministic within documented tolerances.
- All research claims have primary-source provenance and a claim label.
- Licence review is complete for every included code or weight artifact.
- No required task needs a GPU, model download, account, API, or backend.
- Course validation, exercise tests, builds, browser tests, accessibility tests,
  and sandbox tests pass from a clean checkout.
- At least five target learners complete one foundation lesson and one frontier
  lesson, with transition gaps recorded before release.
