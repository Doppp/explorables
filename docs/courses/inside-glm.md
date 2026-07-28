# Inside GLM course brief

Status: accepted concept; source freeze required before implementation
Prerequisites: `AI from First Principles` v0.2 and `Open Frontier Models:
Shared Techniques` v0.1
Candidate release: GLM 4.5, with exact base and instruction artifacts to be
selected

## Promise

Reconstruct selected sparse-model, hybrid-reasoning, and agentic-evaluation
techniques from a pinned GLM release while separating model behavior from the
tool and environment scaffolding around it.

## Learning outcomes

After completing the course, a learner can:

- reconcile the pinned base/instruction artifacts, configuration, and claims;
- implement and inspect a toy sparse block under the shared accounting model;
- represent reasoning mode and inference budget as explicit experimental
  variables;
- model tool calls, observations, invalid actions, and termination as a
  constrained trajectory;
- distinguish model error, tool-schema error, environment error, and evaluator
  error;
- design a long-horizon evaluation without crediting agent scaffolding to the
  model.

## Provisional curriculum

1. **Reading GLM 4.5** — base/instruction boundaries, configuration, licences,
   sparse anatomy, reported reasoning and agentic claims, and missing evidence.
2. **Sparse execution** — routed experts, active parameters, capacity,
   utilisation, and deterministic failure analysis.
3. **Hybrid reasoning controls** — budgets, modes, stopping, outcome/process
   signals, and evaluation units.
4. **Tool-use trajectories** — schemas, actions, observations, invalid states,
   recovery, termination, and sandbox boundaries.
5. **Agentic evaluation** — model-versus-scaffold ablations, long-horizon
   success, partial credit, variance, and claim limits.

## Explorable and exercise spine

| Lesson | Explorable | Focused implementation |
| --- | --- | --- |
| Release anatomy | Base/instruction evidence and parameter map | Normalise selected artifacts |
| Sparse execution | Router, capacity, and utilisation trace | Implement deterministic routing |
| Reasoning controls | Mode/budget/termination state | Enforce a bounded reasoning loop |
| Tool trajectories | Model-tool-environment state machine | Validate constrained tool calls |
| Agentic evaluation | Scaffold ablation and failure taxonomy | Score deterministic trajectories |

## Capstone

Extend the foundation model with a toy sparse block and place it inside a
bounded tool environment. Compare model-only, scaffold-only, and combined
changes on deterministic trajectories. Attribute improvements and failures to
the component actually changed.

## Boundary

The course does not teach generic agent construction as a product workflow. It
uses a constrained environment to study pinned GLM claims and evaluation
methods. Shared artifact, accounting, and reproduction skills remain in the
frontier core.

## Acceptance criteria

- Exact base/instruction artifacts, commits, cards, licences, and evaluation
  protocols are frozen.
- Sparse routing and tool trajectories are deterministic and independently
  tested.
- Every loop has an explicit action schema, budget, invalid-action path, and
  termination condition.
- Agentic results include model/scaffold ablations and failure attribution.
- The course passes locally without production weights, accounts, APIs, GPUs,
  or network services.
