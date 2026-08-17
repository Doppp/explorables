# Inside MiniMax course brief

Status: accepted concept; source freeze required before implementation Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models: Shared Techniques` v0.1 Candidate release: MiniMax M1

## Promise

Reconstruct selected hybrid-attention, long-context, and reasoning techniques from a pinned MiniMax release and evaluate their trade-offs on deterministic sequence tasks.

## Learning outcomes

After completing the course, a learner can:

- read the pinned release's architecture and evidence package critically;
- implement toy full and efficient attention paths under one interface;
- build and test a hybrid layer schedule;
- compare memory, work, state growth, and recall as sequence length changes;
- identify adversarial sequences that expose efficient-attention limitations;
- evaluate a reasoning-budget claim separately from long-context behavior.

## Provisional curriculum

1. **Reading MiniMax M1** — release artifacts, configuration, licences, attention schedule, reported claims, and missing evidence.
2. **Efficient attention state** — recurrent update, decay, retrieval, numerical behavior, and causal invariants.
3. **Hybrid attention** — layer schedules, local/global information paths, memory, compute, and failure cases.
4. **Long-context experiments** — retrieval distance, distractors, state capacity, cost scaling, and claim-aligned metrics.
5. **Reasoning and context** — sampled work, budgets, stopping, reward evidence, and avoiding causal stories unsupported by the experiment.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | Evidence and layer-schedule map | Parse the pinned architecture |
| Efficient state | Recurrent state stepper | Implement a stable state update |
| Hybrid attention | Edit the layer schedule and trace information | Build a valid hybrid schedule |
| Long context | Cost/recall curves with distractors | Implement the retrieval benchmark |
| Reasoning | Context/budget/score comparison | Validate a claim-aligned protocol |

## Capstone

Replace selected foundation attention layers with a toy efficient path while retaining periodic full attention. Compare at least two schedules on recall, memory, compute, and adversarial sequences. State why the result does not reproduce production long-context or reasoning capability.

## Boundary

This course owns the pinned MiniMax interpretation and hybrid composition. Generic experiment design and cost units come from the shared core; efficient attention learned in another model course is optional context, not a hidden prerequisite.

## Acceptance criteria

- The exact report, repository commit, model card, weight terms, and evaluation protocol are frozen.
- Efficient and full paths have causal and numerical unit tests.
- Hybrid schedules are deterministic and preserve declared layer counts.
- Long-context results report both quality and resource costs.
- The course passes clean-checkout validation without production weights, accounts, APIs, GPUs, or network services.
