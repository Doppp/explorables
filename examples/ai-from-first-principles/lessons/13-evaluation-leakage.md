---
id: evaluation-leakage
title: Evaluation leakage
order: 13
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Record your prediction"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "Which split will score higher, and which claim will each score support?"
  - { id: experiment, title: "Save an evaluation-split experiment", phase: experiment, completion: explorable-event, instanceId: leakage-lab, event: experiment-recorded }
  - { id: implement, title: "Attempt the exercise and run its tests", phase: apply, completion: learner }
  - id: explain
    title: "State the supported claim and one failure mode"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "What claim does your evidence support, and what does it not establish?"
objectives:
  - distinguish examples from independent task families
  - identify contamination across a train-test boundary
  - design a grouped evaluation split
  - state a reproducible claim supported by the chosen split
---

# Evaluation leakage

A split can be technically disjoint while still leaking the answer. Here each task family has several lightly rewritten variants.

> **Predict:** Will a random example-level split or a family-level split report higher accuracy for a memorising system? Which result better estimates a new family?

:::explorable{src="../explorables/leakage/index.ts" title="Evaluation leakage split laboratory" height="570" id="leakage-lab"}
Choose how many task families and variants to create, then compare two split units. The laboratory exposes which test families occurred in training and lets you save the resulting scores as evidence.
:::

## Diagnose the flattering score

Turn leakage on and inspect test rows marked “family seen in train.” The score is reproducible and still invalid for the stated claim.

The capstone makes the same failure concrete: its cyclic training corpus is easy to fit, while a held-out corpus follows a different transition pattern. Reporting training accuracy as held-out performance changes the claim without changing a single prediction.

:::exercise{path="../exercises/leakage" command="pnpm exec vitest run exercises/leakage/tests --config vitest.exercise.config.ts" title="Create a leakage-safe split"}
Implement a deterministic grouped split. The starter shuffles examples rather than task families. Add one test based on a family/variant combination you created in the laboratory.
:::

## In real models

Frontier-model tables combine model weights, prompts, tools, harnesses, sampling, and benchmark versions. The shared research course turns those release artifacts into explicit evidence, while each specialization labels claims as reported, reproduced, or inferred.

## Explain and transfer

Name two other identities—user, repository, time window, document source—that might need grouping in a real evaluation. What claim does each split support?

Write down the corpus version, grouping key, split procedure, model state, decoding policy, metric, and random seed or deterministic tie-breaking rule. Another person should be able to recreate the score and determine exactly which generalisation claim it does—and does not—support.
