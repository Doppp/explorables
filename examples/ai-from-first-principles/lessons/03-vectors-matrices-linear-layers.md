---
id: vectors-matrices-linear-layers
title: Vectors, matrices, and linear layers
order: 3
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

A linear layer applies `y = Wx + b`. The notation compresses several dot
products: each row of `W` combines the same input vector into one output value.

> **Predict:** For a weight matrix with two rows and three columns, what shape
> must `x` have, and how many values will appear in `y`? If you transpose `W`,
> can the same multiplication still work?

:::explorable{src="../explorables/linear-layers/index.ts" title="Shape-aware linear projection workbench" height="560" id="linear-projection"}
Edit a three-value input, two weight rows, and two biases. The workbench expands
each output into its individual products and displays every tensor shape.
Transposing the weights deliberately produces an incompatible shape and an
actionable error instead of an invalid numerical result.
:::

## Inspect the projection

Change only the first input value. Both outputs can change because both weight
rows read that input. Now make the two weight rows identical: the outputs differ
only by their biases, so the layer has lost one distinct learned feature.

:::exercise{path="../exercises/linear-layer" command="pnpm exec vitest run exercises/linear-layer/tests --config vitest.exercise.config.ts" title="Implement a linear-layer forward pass"}
Validate the shapes, calculate one dot product per weight row, and add the
matching bias. The starter treats weight columns as outputs and therefore uses
the wrong orientation.
:::

## In real models

Transformer query, key, value, output, gate, and expert projections are all
structured uses of this operation. Sparse and latent-expert architectures
change which matrices run and at what width; they do not remove the need to
track shapes and parameter counts precisely.

## Explain and transfer

Why does the number of weight rows determine the output width? A Transformer
will later use several different weight matrices to project the same token
representation into queries, keys, and values—what can those projections learn
to preserve differently?
