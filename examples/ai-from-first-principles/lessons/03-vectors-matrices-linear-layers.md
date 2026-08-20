---
id: vectors-matrices-linear-layers
title: Vectors, matrices, and linear layers
order: 4
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate the linear projection", completion: explorable-event, instanceId: linear-projection, event: parameter-changed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - track shapes through a matrix-vector product
  - interpret each weight row as one output feature
  - implement and debug a linear-layer forward pass
prerequisites:
  - backpropagation
---

# Vectors, matrices, and linear layers

So far each symbol has held one number. Neural networks usually process groups of numbers at once. This lesson assumes only arrays and multiplication; backpropagation will matter again when these weights are trained, but first we will make the forward calculation and its shapes concrete.

## Values, vectors, and matrices

A **scalar** is one number. A **vector** is an ordered list of numbers, represented here as a one-dimensional TypeScript array. Its **shape** is its length: `[2, −1]` has shape `[2]`.

A **matrix** is a rectangular grid of numbers, represented as an array of equal-length rows. Its shape is written `[rows × columns]`. For example,

```text
W = [[ 1,  3],
     [0.5, -2],
     [-1,  0]]
```

has shape `[3 × 2]`: three rows, two columns. The position of a number matters; these arrays are not unordered collections.

The **dot product** of two equal-length vectors multiplies matching positions and adds the products:

`[a, b] · [c, d] = ac + bd`

A **linear layer** uses a weight matrix `W` and a bias vector `b` to transform an input vector `x`:

`y = Wx + b`

Strictly speaking, adding `b` makes this an affine transformation, but “linear layer” is the standard name. The entries of `W` and `b` are trainable **parameters**. Each row of `W` takes one dot product with the entire input and produces one output value; the corresponding bias then shifts that output.

## A fully worked projection

Use the matrix above with `x = [2, −1]` and `b = [0, 1, 0.5]`. The shapes are:

`W [3 × 2] · x [2] + b [3] → y [3]`

There is one calculation per weight row:

```text
y₀ = 1(2)   + 3(−1)  + 0   = −1
y₁ = 0.5(2) + (−2)(−1) + 1 = 4
y₂ = −1(2)  + 0(−1)  + 0.5 = −1.5
```

Therefore `y = [−1, 4, −1.5]`. The two weight columns match the two input values, while the three weight rows match the three outputs and three biases.

## Predict the shapes

Use the worked example as a pattern, but reason about the new dimensions before trying the controls.

> **Predict:** For a weight matrix with two rows and three columns, what shape must `x` have, and how many values will appear in `y`? If you transpose `W`, can the same multiplication still work?

:::explorable{src="../explorables/linear-layers/index.ts" title="Shape-aware linear projection workbench" height="560" id="linear-projection"}
Edit a three-value input, two weight rows, and two biases. The workbench expands each output into its individual products and displays every tensor shape. Transposing the weights deliberately produces an incompatible shape and an actionable error instead of an invalid numerical result.
:::

## Explain the projection

The initial workbench uses these values:

```text
x  = [ 2, −1, 0.5]
W₀ = [ 1,  2, 0  ]    b₀ =  0.5
W₁ = [−1,  0, 4  ]    b₁ = −0.5
```

Expanding `Wx + b` gives:

```text
y₀ = 1(2)  + 2(−1) + 0(0.5) + 0.5  =  0.5
y₁ = −1(2) + 0(−1) + 4(0.5) − 0.5  = −0.5
```

The result has two values because `W` has two rows. Each value is an **output feature**: one learned combination of the inputs. The three columns are what allow every row to pair with the three-value input. The layer contains `2 × 3 = 6` weight parameters and `2` bias parameters.

## Inspect the projection

Change only the first input value. Both outputs can change because both weight rows read that input. Now make the two weight rows identical: the outputs differ only by their biases, so the layer has lost one distinct learned feature.

More precisely, if the first input changes by `Δ`, each output changes by `Δ` times the weight in that row's first column. A zero weight disconnects that input from that output. If two rows are identical, their dot-product parts are identical for every input; only different biases can separate them by a fixed offset.

Turn on **Transpose W before multiplying (broken)**. Transposition swaps rows and columns, so `[2 × 3]` becomes `[3 × 2]`. That transposed matrix expects a two-value input and produces three outputs. The existing `x` still has three values and `b` still has two, so this is not the same operation. The workbench reports the first mismatch and restates the input-column and bias-row rules instead of fabricating numbers.

## Bridge shapes to TypeScript

The mathematical orientation maps directly to nested-array indices:

`weights[outputIndex][inputIndex]`

That means the outer iteration should correspond to outputs, and each inner row should pair position-by-position with the input. Before calculating, a robust implementation checks that:

- the matrix is non-empty and every row has the same non-zero length;
- the input length equals the number of weight columns;
- the bias length equals the number of weight rows; and
- every numeric value is finite.

Then test one row by writing out its products as the workbench does. Keep the input arrays unchanged so a forward pass does not silently modify the model's caller-owned data.

:::exercise{path="../exercises/linear-layer" command="pnpm exec vitest run exercises/linear-layer/tests --config vitest.exercise.config.ts" title="Implement a linear-layer forward pass"}
Validate the shapes, calculate one dot product per weight row, and add the matching bias. The starter treats weight columns as outputs and therefore uses the wrong orientation.
:::

Common failure modes to look for:

- iterating over columns as though each column were an output;
- multiplying vectors of unequal length and treating missing entries as zero;
- accepting ragged matrices whose rows have different lengths;
- adding one bias to every output or using the wrong bias index;
- returning the correct values in the wrong order; and
- transposing by habit because another library stores weights differently.

## In real models

Transformer query, key, value, output, gate, and expert projections are all structured uses of this operation. Sparse and latent-expert architectures change which matrices run and at what width; they do not remove the need to track shapes and parameter counts precisely.

## Recap and self-check

For `W` with shape `[m × n]`, `x` must have length `n`, `b` must have length `m`, and `y` has length `m`. Each output is one weight-row dot product plus one bias.

As a quick check, sketch the shapes and parameter count for a layer that maps a four-value input to six outputs. Then explain why a six-value bias fits but a four-value bias does not.

## Explain and transfer

Why does the number of weight rows determine the output width? A Transformer will later use several different weight matrices to project the same token representation into queries, keys, and values—what can those projections learn to preserve differently?
