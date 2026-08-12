---
id: self-attention
title: Self-attention
order: 7
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate the attention matrix", completion: explorable-event, instanceId: attention-workbench, event: parameter-changed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - compute scaled query-key scores
  - interpret softmax rows as mixing weights
  - explain why a causal mask is applied before softmax
---

# Self-attention

Each token's query scores every key. Softmax turns those scores into weights
used to mix values.

> **Predict:** With a causal mask on, can token 2 assign any weight to token 3?
> Predict what happens if masking is applied after softmax instead.

:::explorable{src="../explorables/attention/index.ts" title="Self-attention score and weight matrices" height="610" id="attention-workbench"}
Edit three one-dimensional query and key values. The workbench shows scaled
scores and row-wise softmax weights. The causal mask replaces future scores
with negative infinity before softmax; a broken after-softmax toggle leaves
rows summing to less than one.
:::

## Inspect the invariant

Every valid attention row sums to one. Turn on the broken mask and locate the
row that violates this invariant.

:::exercise{path="../exercises/attention" command="pnpm exec vitest run exercises/attention/tests --config vitest.exercise.config.ts" title="Implement masked attention weights"}
Implement stable softmax and causal masking. The starter masks probabilities
without renormalising.
:::

## In real models

This full softmax-attention path is the comparison baseline for MLA, linear
attention, DeltaNet, KDA, and other efficient variants. Those mechanisms are
meaningful only when we can state what information, memory growth, or retrieval
behavior changed relative to this baseline.

## Explain and transfer

What information leak appears during next-token training if future positions
are not masked?
