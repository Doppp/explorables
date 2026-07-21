---
id: gradient-descent
title: Gradient descent
order: 1
objectives:
  - interpret a gradient as local slope
  - predict how learning rate changes convergence
  - implement and debug one update step
---

# Gradient descent

We want the parameter θ to reach the minimum of `L(θ) = (θ − 3)²`.

> **Predict:** Starting at θ = −4, will a learning rate of 1.1 converge,
> oscillate, or diverge? Write down your reason before taking a step.

:::explorable{src="../explorables/gradient-descent/index.ts" title="Gradient descent loss curve and stepper" height="470"}
The curve is a bowl with its minimum at θ = 3. Each step subtracts the learning
rate times the gradient. Rates below 1 move toward the minimum; a rate above 1
can cross the bowl with increasing distance. The controls expose θ, loss,
gradient, and step history.
:::

## Debug the update

Set the rate to `1.1` and take four steps. The failure is not a wrong gradient:
the step size amplifies the distance after each sign change.

:::exercise{path="../exercises/gradient-descent" command="pnpm exec vitest run exercises/gradient-descent/tests --config vitest.exercise.config.ts" title="Implement one gradient update"}
Implement loss, gradient, and a guarded update step. The starter intentionally
uses the gradient sign incorrectly.
:::

## Explain and transfer

Why does multiplying every gradient by a constant resemble changing the
learning rate? What stops that equivalence in an adaptive optimiser?
