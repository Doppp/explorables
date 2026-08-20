---
id: backpropagation
title: Backpropagation
order: 3
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate the computation graph", completion: explorable-event, instanceId: backprop-graph, event: parameter-changed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - separate forward values from local derivatives
  - apply the chain rule through a small graph
  - identify a missing gradient factor
---

# Backpropagation

Gradient descent needs the slope of the loss with respect to every parameter. In the prior lesson
one formula gave that slope directly. A real model is a chain of many small operations, so we need
a reliable way to combine their slopes.

You need only multiplication, addition, and the gradient idea from lesson 1. The notation `dy/dw` means “how sensitively does `y` change when `w` changes?” It is read as “the derivative of y with respect to w.”

## A two-operation computation graph

Our graph evaluates two operations in order:

`z = xw + b` → `y = z²`

Here `y` is the final scalar quantity whose derivatives we want. In a training graph, the final
scalar would normally be the loss; this smaller graph uses a square only to make the chain rule
visible. It is not claiming that every model prediction or loss is literally `z²`.

A **computation graph** represents values as nodes and operations as connections between them. It supports two passes:

- The **forward pass** evaluates from inputs to output and stores intermediate values such as `z`.
- The **backward pass**, or **backpropagation**, starts at the output and works backward to find how each earlier value affects it.

Each operation knows a **local derivative**: its own output's sensitivity to each direct input. The **chain rule** says to multiply local derivatives along a path. A gradient arriving from later in the graph is often called the **upstream gradient**.

For this graph, the local derivatives are:

- For `y = z²`, the local derivative is `dy/dz = 2z`.
- For `z = xw + b`, the local derivative with respect to `x` is `dz/dx = w`.
- For `z = xw + b`, the local derivative with respect to `w` is `dz/dw = x`.
- For `z = xw + b`, the local derivative with respect to `b` is `dz/db = 1`.

## A fully worked trace

Use `x = 3`, `w = 2`, and `b = −1`:

1. Forward: `z = 3(2) − 1 = 5`, then `y = 5² = 25`.
2. Start backward: `dy/dy = 1`.
3. Through the square: `dy/dz = 2(5) = 10`.
4. To `w`: `dy/dw = (dy/dz)(dz/dw) = 10(3) = 30`.
5. To `x`: `dy/dx = (dy/dz)(dz/dx) = 10(2) = 20`.
6. To `b`: `dy/db = (dy/dz)(dz/db) = 10(1) = 10`.

Notice that `30` is not a new rule memorised for `w`: it is the product of the two local effects on the path from `w` to `y`.

## Predict, then inspect

Apply the same path logic to a different set of values. Work out `z`, then reason about the signs of the two factors on the path from `w` to `y`.

> **Predict:** If `x = 2`, `w = −1`, and `b = 3`, is `dy/dw` positive or negative? Decide before revealing the gradients.

:::explorable{src="../explorables/backpropagation/index.ts" title="Forward and backward computation graph" height="500" id="backprop-graph"}
Edit x, w, and b. The graph shows forward values and the backward gradients `dy/dz = 2z`, `dz/dw = x`, and `dy/dw = (dy/dz)(dz/dw)`. A “drop chain-rule factor” switch deliberately shows the common wrong gradient.
:::

## Explain what the graph revealed

For the prediction values, the forward pass gives `z = 2(−1) + 3 = 1` and `y = 1`. The backward path to `w` is:

`dy/dw = (2z)(x) = 2(1)(2) = 4`

The gradient is positive. The other input gradients are `dy/dx = (2z)w = −2` and `dy/db = (2z)(1) = 2`. Each answer combines the same upstream value `2z` with a different local derivative.

Caching `z` during the forward pass matters because the square operation needs its actual input to compute `2z` later. Large models trade memory against recomputation, but they cannot invent a backward derivative without the needed forward information.

## Find the broken path

Toggle the broken gradient and compare it with a finite-difference check. The omitted factor is `dz/dw = x`, so the broken and correct values disagree whenever `x ≠ 1` and the upstream gradient `2z` is non-zero. The absolute mismatch is not monotonic in `x`, because changing `x` also changes `z`.

With the initial values, the broken display reports `2z = 2` instead of `(2z)x = 4`. When `2z` is non-zero, the correct value is the broken value multiplied by `x`; changing `x` away from `1` makes the omitted factor visible. The exact absolute mismatch also depends on how changing `x` changes `z`.

A **finite-difference check** estimates a derivative without using backpropagation. It nudges `w` slightly in both directions and measures the output change:

`dy/dw ≈ [y(w + ε) − y(w − ε)] / (2ε)`

Here `ε` is a small positive number. Agreement does not prove every gradient is correct, but disagreement is strong evidence that a factor, sign, or path is wrong. This gives you an independent debugging representation rather than asking backpropagation to check itself.

## Bridge the graph to code

Keep the two passes conceptually separate when you open the exercise:

1. Compute and retain the forward intermediate `z`, then compute `y`.
2. Begin the backward pass at the output.
3. For each returned gradient, trace one path and multiply every local derivative on it.
4. Compare one result with a small numerical nudge before trusting the whole object.

The returned fields `dx`, `dw`, and `db` are sensitivities of the final `y`, not the local derivatives of `z` by themselves. That naming distinction is the heart of the intentional starter bug; the lesson gives you the factors, while the exercise still asks you to assemble and verify them.

:::exercise{path="../exercises/backpropagation" command="pnpm exec vitest run exercises/backpropagation/tests --config vitest.exercise.config.ts" title="Differentiate the graph"}
Return the forward values and gradients for every input. The starter omits one chain-rule factor.
:::

Common failure modes to look for:

- returning `dz/dw` when the caller asked for `dy/dw`;
- adding path derivatives instead of multiplying along one path;
- losing a negative sign from `w`, `x`, or `z`;
- recomputing with a changed value instead of the value from the forward pass; and
- trusting a finite-difference check with an `ε` so large it is no longer local or so tiny that floating-point rounding dominates.

## In real models

Every dense projection, attention path, expert router, gate, and residual path in a production language model depends on the same chain rule. Later model case studies isolate one architectural change at a time so its gradient path can be checked instead of treating the released system as a black box.

## Recap and self-check

You should now be able to distinguish a forward value, a local derivative, and a final gradient. Given any one path through this graph, annotate the forward values from left to right and multiply the local derivatives from right to left.

As a quick check, set `x = 1`, `w = 2`, and `b = −2`. Before using the explorable, decide which gradients become zero and explain which forward value causes that result.

## Explain and transfer

Why is caching `z` useful during the backward pass? If the final operation were `y = z³`, with local derivative `dy/dz = 3z²`, which forward value would its backward step need?
