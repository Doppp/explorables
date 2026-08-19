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

The previous lesson described one attention calculation. That single head creates one score matrix and one way to mix values. **Multi-head attention** runs several learned attention calculations in parallel, then combines their outputs into one residual-stream update.

## From model width to head width

Let:

- `n` be the sequence length;
- `d_model` be the width of each residual-stream vector;
- `H` be the number of heads;
- `d_head = d_model / H` be the width handled by each head in this lesson.

The width must divide evenly. With `d_model = 4` and `H = 2`, each head receives width 2.

The current residual-stream matrix `X` has shape `[n][d_model]`. Three learned linear projections create full-width query, key, and value matrices:

```text
Q = projectQuery(X)
K = projectKey(X)
V = projectValue(X)
```

Each projected token vector is then reshaped into `H` head slices. A **head** is one independent scaled dot-product attention calculation over its own query, key, and value slice. It produces its own `[n][n]` weight matrix and `[n][d_head]` value mixture.

> **Predict:** A model width of 4 is split into 2 heads. How wide is each head? If both heads accidentally reuse the first feature slice, what information is lost?

:::explorable{src="../explorables/multi-head-attention/index.ts" title="Two-head causal attention workbench" height="850" id="multi-head-workbench"}
Edit the three four-dimensional token vectors and compare both causal attention matrices. Change only the last two coordinates of one token, then change only the first two. Toggle the causal mask to reveal future columns. Finally enable **Reuse head 1 features for both heads (broken)** and inspect the two matrices and concatenated outputs.
:::

## What the manipulation shows

In this workbench, the projection matrices are the identity matrix, so the projected query, key, and value vectors equal the editable inputs. Head 1 receives coordinates 0–1 and Head 2 receives coordinates 2–3. Changing the final pair can therefore change Head 2 while leaving Head 1 unchanged.

That identity projection is a teaching simplification. In a trained Transformer, learned query, key, and value projections can mix information from all residual coordinates before the result is reshaped into heads. A production head is not permanently assigned to the same raw input coordinates, and its learned behavior should be established from evidence rather than a semantic nickname.

With the causal mask off, cells above the diagonal become available: earlier query positions can read later source positions. With broken head reuse on, both heads receive slice 0, their computations become identical in this toy, and slice 1 is discarded.

## A worked split and combine

For one projected token vector:

```text
[1, 2, 10, 20]
```

a contiguous two-head split is:

```text
Head 1: [1, 2]
Head 2: [10, 20]
```

After each head performs causal attention, suppose their output vectors for this token are `[0.4, 0.6]` and `[8, 12]`. **Concatenation** joins them in the original stable order:

```text
[0.4, 0.6, 8, 12]
```

Concatenation restores width `d_model`, but it does not by itself let features from different heads interact. A learned **output projection** maps the concatenated vector back into the model width and can mix coordinates across heads. The surrounding Transformer block adds that projected result to the residual stream.

## The complete shape pipeline

For each head `h`, the same attention rules from the previous lesson apply: compare `Q_h` with `K_h`, divide scores by `sqrt(d_head)`, mask future scores before softmax, then use the normalized weights to mix `V_h`.

- **Residual stream `X`:** `[n][d_model]`.
- **Projected `Q`, `K`, `V`:** three matrices of `[n][d_model]`.
- **Reshaped `Q`, `K`, `V`:** three tensors of `[n][H][d_head]`.
- **Weights for one head:** `[n][n]`.
- **Outputs for all heads:** `[n][H][d_head]`.
- **Concatenated outputs:** `[n][d_model]`.
- **Output projection result:** `[n][d_model]`.

A **tensor** here simply means a nested numeric array with more than two axes. In TypeScript, `[n][H][d_head]` is represented by `number[][][]`: token, then head, then feature coordinate.

Stable head order is a contract. If concatenation unexpectedly swaps heads, the output projection receives each learned feature in the wrong coordinate and applies the wrong weights.

:::exercise{path="../exercises/multi-head-attention" command="pnpm exec vitest run exercises/multi-head-attention/tests --config vitest.exercise.config.ts" title="Implement causal multi-head attention"}
Split features into contiguous heads, scale query-key scores, mask before softmax, mix values, and concatenate the head outputs in their original order. The starter interleaves features, omits scaling, and masks after normalisation.
:::

## Common failure modes

- **Using an incompatible head count:** `d_model / H` is not an integer, so slices have inconsistent widths.
- **Interleaving instead of taking contiguous slices:** the implementation violates the exercise's declared reshape convention.
- **Reusing one slice for every head:** information from the other slices disappears.
- **Omitting score scaling or masking too late:** each head inherits the numerical and causal failures from single-head attention.
- **Concatenating in a changing order:** the output projection sees features in the wrong coordinates.
- **Stopping at concatenation:** head outputs keep their width, but there is no learned cross-head mixing before the residual update.

## In real models

Production architectures vary how heads share or compress keys and values. Grouped-query attention and multi-head latent attention reduce memory or projection cost while preserving multiple learned query paths; later case studies measure those trade-offs rather than comparing names alone.

## Recap and self-check

Multi-head attention projects one residual stream into queries, keys, and values; reshapes each into heads; runs an independent causal distribution per head; concatenates the head outputs; and applies an output projection back to `d_model`.

Check your understanding:

- For `n = 3`, `d_model = 4`, and `H = 2`, what are the shapes of one head's queries, weights, and outputs?
- Why does changing the last two raw features affect only Head 2 in this workbench but not necessarily in a trained model?
- Why must concatenation preserve a stable head order?
- What role does the output projection play after independent heads have produced their mixtures?
