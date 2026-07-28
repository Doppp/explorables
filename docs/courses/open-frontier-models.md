# Open Frontier Models: Shared Techniques course brief

Status: accepted; awaits source freeze and implementation
Prerequisite: `AI from First Principles` v0.2
Unlocks: `Inside DeepSeek`, `Inside Kimi`, `Inside Qwen`, `Inside MiniMax`, and
`Inside GLM`

## Promise

Learn the common research skills needed to study open-weight frontier models:
inspect artifacts, normalise configurations, account for parameters and
systems costs, compare controlled changes, and state what public evidence can
and cannot establish.

This is a compact shared core, not a survey that absorbs every lab. Distinctive
algorithms and model histories belong to the model-specific courses.

## Learning outcomes

After completing the course, a learner can:

- distinguish a model architecture, checkpoint, model card, repository,
  technical report, training recipe, and evaluation harness;
- inspect code, weight, data, and figure licences separately;
- normalise heterogeneous model configurations without erasing meaningful
  differences;
- distinguish total parameters, active parameters, weight memory, KV-cache
  memory, training compute, inference compute, and communication;
- design a deterministic comparison against the foundation Transformer;
- label a technical claim as reported, reproduced, or inferred;
- produce a machine-checkable experiment manifest and evidence dossier.

## Curriculum

1. **Reading a frontier-model release** — artifact types, release boundaries,
   base versus instruction checkpoints, primary sources, licences, and missing
   evidence.
2. **Normalising model configurations** — dimensions, layer counts, attention
   variants, expert counts, active parameters, context, precision, and
   vocabulary.
3. **Accounting for memory, compute, and communication** — parameter memory,
   KV-cache growth, active compute, training state, batching, and simulated
   communication costs.
4. **Controlled comparisons** — pin the foundation baseline, change one
   mechanism, choose deterministic measurements, record tolerances, and expose
   confounders.
5. **Reproducing a public claim** — source provenance, claim labels,
   experiment manifests, uncertainty, negative results, licences, and explicit
   limits.

## Explorable plan

| Lesson | Learner-controlled explorable |
| --- | --- |
| Release anatomy | Assemble an evidence graph and reveal missing artifacts |
| Configuration normalisation | Compare heterogeneous configs in one canonical schema |
| Cost accounting | Change architecture and precision while tracing memory/compute |
| Controlled comparison | Toggle variables and expose confounded conclusions |
| Claim reproduction | Edit evidence and assumptions in a reproducibility dossier |

## Exercises

- classify and link a release's public artifacts;
- normalise heterogeneous configuration fixtures;
- calculate total/active parameters and memory from a canonical config;
- construct a controlled experiment against the tiny Transformer;
- produce a valid machine-checkable experiment and provenance manifest.

Each starter fails for one relevant research or accounting error. No required
exercise downloads weights, calls an API, or executes production training code.

## Capstone

Create a model dossier for one pinned release that includes:

- artifact and licence matrix;
- normalised configuration;
- parameter, memory, compute, and communication estimates;
- one precisely worded source claim;
- controlled toy experiment proposal;
- machine-checkable manifest;
- explicit missing evidence and conclusion limits.

The dossier becomes the entry artifact for a model-specific course. It does not
claim to reproduce production capability.

## Boundary with model courses

The shared core owns research method, canonical schemas, accounting utilities,
and the baseline comparison harness.

Model courses own:

- the history and anatomy of their pinned releases;
- distinctive algorithms and combinations;
- lab-specific source interpretation;
- technical exercises and failure modes;
- controlled reconstruction capstones.

A model course links to shared lessons rather than copying them. Named models
may appear as examples in the shared core, but no example substitutes for its
dedicated course.

## Research integrity

Every technical claim is marked:

- **reported** when it comes from the originating lab;
- **reproduced** when the course recreates it under documented conditions;
- **inferred** when it is our interpretation of public evidence.

Performance claims from incompatible models, hardware, data, agents, or
evaluation protocols are not presented as direct comparisons.

The candidate source register is
[../research/open-frontier-models-sources.md](../research/open-frontier-models-sources.md).

## Acceptance criteria

- Every prerequisite maps to a completed foundation lesson and artifact.
- All five lessons contain prediction, manipulation, implementation,
  debugging, explanation, and transfer.
- Canonical configuration and experiment-manifest schemas are tested.
- Mathematical models are tested separately from their visual interfaces.
- Seeded runs are deterministic within documented tolerances.
- All claims have primary-source provenance and a claim label.
- Licence review is complete for every included artifact.
- The capstone dossier is consumable by every model-course template.
- No required task needs a GPU, model download, account, API, or backend.
- Validation, exercise, build, browser, accessibility, and sandbox checks pass
  from a clean checkout.
