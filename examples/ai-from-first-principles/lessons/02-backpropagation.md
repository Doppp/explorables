---
id: backpropagation
title: Backpropagation
order: 2
objectives:
  - separate forward values from local derivatives
  - apply the chain rule through a small graph
  - identify a missing gradient factor
---

# Backpropagation

Our graph computes `z = xw + b`, then `y = z²`. Backpropagation reuses the
forward value of `z` while multiplying local derivatives backward.

> **Predict:** If `x = 2`, `w = −1`, and `b = 3`, is `dy/dw` positive or
> negative? Decide before revealing the gradients.

:::explorable{src="../explorables/backpropagation/index.ts" title="Forward and backward computation graph" height="500"}
Edit x, w, and b. The graph shows forward values and the backward gradients
`dy/dz = 2z`, `dz/dw = x`, and `dy/dw = (dy/dz)(dz/dw)`. A “drop chain-rule
factor” switch deliberately shows the common wrong gradient.
:::

## Find the broken path

Toggle the broken gradient. Compare its value with a finite-difference check;
the error grows with `x` because the missing local derivative is `dz/dw = x`.

:::exercise{path="../exercises/backpropagation" command="pnpm exec vitest run exercises/backpropagation/tests --config vitest.exercise.config.ts" title="Differentiate the graph"}
Return the forward values and gradients for every input. The starter omits one
chain-rule factor.
:::

## Explain and transfer

Why is caching `z` useful during the backward pass? Which cached values would
you need if `y = tanh(z)` instead?
