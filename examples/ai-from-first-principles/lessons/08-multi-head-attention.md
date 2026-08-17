---
id: multi-head-attention
title: Multi-head attention
order: 8
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate the attention heads", completion: explorable-event, instanceId: multi-head-workbench, event: parameter-changed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - project and split a residual-stream vector into attention heads
  - compute an independent causal attention distribution per head
  - concatenate head outputs and apply an output projection
prerequisites:
  - embeddings-positional-information
  - self-attention
---

# Multi-head attention

One attention operation produces one mixing pattern. Multi-head attention first projects the residual stream, splits its width, lets each head mix the sequence independently, concatenates the results, and projects them back to the model width.

> **Predict:** A model width of 4 is split into 2 heads. How wide is each head? If both heads accidentally reuse the first feature slice, what information is lost?

:::explorable{src="../explorables/multi-head-attention/index.ts" title="Two-head causal attention workbench" height="850" id="multi-head-workbench"}
Edit three four-dimensional token vectors and compare the two causal attention matrices. Each head receives a different two-dimensional slice before the outputs are concatenated. A broken switch sends the first slice to both heads, making their weights identical and discarding the second slice.
:::

## Inspect independent mixtures

Change only the last two features of a token. Head 1 is unchanged while Head 2 can change, because the heads receive different feature slices in this toy projection. Turn off the causal mask and identify the newly visible future positions.

:::exercise{path="../exercises/multi-head-attention" command="pnpm exec vitest run exercises/multi-head-attention/tests --config vitest.exercise.config.ts" title="Implement causal multi-head attention"}
Split features into contiguous heads, scale query-key scores, mask before softmax, mix values, and concatenate the head outputs in their original order. The starter interleaves features, omits scaling, and masks after normalisation.
:::

## In real models

Production architectures vary how heads share or compress keys and values. Grouped-query attention and multi-head latent attention reduce memory or projection cost while preserving multiple learned query paths; later case studies measure those trade-offs rather than comparing names alone.

## Explain and transfer

Why must concatenation preserve a stable head order? What role does the output projection play after independent heads have produced their mixtures?
