# Inside GLM course brief

Status: accepted concept; refreshed for GLM 5.2; source freeze required before implementation Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models: Shared Techniques` v0.1 Candidate release: GLM 5.2, with GLM 5 retained as its architecture and post-training lineage source

## Promise

Reconstruct selected sparse-model, sparse-attention, speculative-decoding, reasoning-control, and agentic-evaluation techniques from pinned GLM 5/5.2 artifacts while separating model behavior from the serving, tool, and environment scaffolding around it.

## Learning outcomes

After completing the course, a learner can:

- reconcile the GLM 5 report with pinned GLM 5.2 BF16/FP8 artifacts, configuration, licence, and release claims;
- implement and inspect a toy sparse block under the shared accounting model;
- implement a toy DSA indexer and compare per-layer selection with cross-layer top-k reuse;
- model multi-token prediction acceptance length and distinguish model changes from speculative-decoding policy;
- represent reasoning mode and inference budget as explicit experimental variables;
- model tool calls, observations, invalid actions, and termination as a constrained trajectory;
- distinguish model error, tool-schema error, environment error, and evaluator error;
- design a long-horizon evaluation without crediting agent scaffolding to the model.

## Provisional curriculum

1. **Reading GLM 5.2** — GLM 5/5.1/5.2 lineage, BF16/FP8 boundaries, configuration, licences, sparse anatomy, reported long-context and agentic claims, and missing evidence.
2. **Sparse execution** — routed experts, active parameters, capacity, utilisation, and deterministic failure analysis.
3. **Sparse attention and index reuse** — DSA selection, indexer cost, cross-layer similarity, Full versus Shared layers, the GLM 5.2 four-layer reuse pattern, and quality/throughput trade-offs. The release calls this deployed pattern `IndexShare`; its linked research paper names the general method `IndexCache`.
4. **Multi-token prediction and serving** — draft steps, acceptance length, index/KV reuse, rejection sampling, latency, and correctness boundaries.
5. **Reasoning controls and long horizons** — effort levels, budgets, stopping, compaction, outcome/process signals, and evaluation units.
6. **Tool-use trajectories** — schemas, actions, observations, invalid states, recovery, termination, and sandbox boundaries.
7. **Agentic evaluation** — model-versus-scaffold-versus-serving ablations, context-management disclosure, long-horizon success, partial credit, variance, and claim limits.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | GLM 5/5.2 evidence and parameter map | Normalise BF16/FP8 artifacts |
| Sparse execution | Router, capacity, and utilisation trace | Implement deterministic routing |
| Sparse attention | Per-layer versus shared top-k trace | Implement bounded index reuse |
| Speculative serving | Draft/accept/reject timeline | Implement lossless token acceptance |
| Reasoning controls | Effort/budget/compaction state | Enforce a bounded reasoning loop |
| Tool trajectories | Model-tool-environment state machine | Validate constrained tool calls |
| Agentic evaluation | Model/scaffold/serving ablation and failure taxonomy | Score deterministic trajectories |

## Capstone

Extend the foundation model with a toy sparse block, sparse indexer with cross-layer reuse, and multi-token draft path, then place it inside a bounded tool environment. Compare model-only, serving-only, scaffold-only, and combined changes on deterministic trajectories. Attribute improvements and failures to the component actually changed.

## Boundary

The course does not teach generic agent construction or production serving as product workflows. It uses bounded reconstructions and a constrained environment to study pinned GLM claims and evaluation methods. Shared artifact, accounting, and reproduction skills remain in the frontier core. GLM 5.2 benchmark values remain reported claims until a matching harness and repeated trials reproduce them.

## Acceptance criteria

- Exact GLM 5 report and IndexCache paper revisions, GLM 5 repository commit, GLM 5.2 BF16/FP8 model-card commits, configurations, licences, and evaluation protocols are frozen.
- Sparse routing, top-k index reuse, speculative acceptance, and tool trajectories are deterministic and independently tested.
- Every loop has an explicit action schema, budget, invalid-action path, and termination condition.
- Agentic results include model/serving/scaffold ablations, context-management disclosure, and failure attribution.
- The course passes locally without production weights, accounts, APIs, GPUs, or network services.
