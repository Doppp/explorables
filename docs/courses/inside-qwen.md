# Inside Qwen course brief

Status: accepted concept; source freeze required before implementation Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models: Shared Techniques` v0.1 Candidate release: Qwen 3, with exact dense and MoE artifacts to be selected

## Promise

Study a pinned Qwen model family through controlled dense-versus-sparse comparisons, documented reasoning controls, and a reproducible adaptation or inference experiment.

## Learning outcomes

After completing the course, a learner can:

- map related dense and MoE configurations into the shared canonical schema;
- compare total parameters, active parameters, memory, and compute without treating model size as the only changed variable;
- implement and inspect a toy dense/sparse block substitution;
- model documented reasoning-budget or mode controls without confusing them with hidden capability;
- design an adaptation or inference comparison with explicit baselines and regression checks;
- explain why benchmark numbers across family members may not be directly comparable.

## Provisional curriculum

1. **Reading a model family** — exact artifact selection, dense/MoE relationships, model cards, licences, evaluation protocols, and claim map.
2. **Dense versus sparse blocks** — parameter accounting, active compute, capacity, routing, memory, and controlled substitutions.
3. **Reasoning controls** — mode or budget representation, output cost, stopping, failure cases, and the boundary between control and capability.
4. **Adaptation and regression** — deterministic low-rank or inference-policy change, narrow capability metric, held-out data, and regression suite.
5. **Family comparison** — compatible baselines, uncertainty, confounders, model/agent separation, and defensible conclusions.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Family anatomy | Normalised dense/MoE comparison | Parse selected family configs |
| Dense versus sparse | Swap blocks and trace active work | Implement a sparse substitution |
| Reasoning controls | Budget/mode state machine | Enforce deterministic stopping |
| Adaptation | Improvement versus regression dashboard | Apply a controlled low-rank update |
| Comparison | Confounder-aware evidence table | Produce the comparison manifest |

## Capstone

Choose the pinned dense or MoE baseline, make one controlled architecture, adaptation, or inference-policy change, and evaluate a narrow capability plus regressions. The final report must separate family-level observations from claims supported by the toy experiment.

## Boundary

The course treats the Qwen family as a model-specific study, not as the generic definition of dense, sparse, reasoning, or adaptation techniques. Shared methods remain in the frontier core.

## Acceptance criteria

- Exact dense and MoE artifacts, commits, cards, licences, and evaluation protocols are frozen before technical implementation.
- Comparisons never conflate total and active parameters.
- Reasoning controls expose token/work budgets and deterministic termination.
- Adaptation results include a held-out metric and regression test.
- The complete course passes locally without downloading a production checkpoint or using an account, API, GPU, or network service.
