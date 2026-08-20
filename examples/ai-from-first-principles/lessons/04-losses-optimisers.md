---
id: losses-optimisers
title: Losses and optimisers
order: 7
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Take a training step", completion: explorable-event, instanceId: optimiser-lab, event: simulation-completed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - relate logits, probabilities, targets, and cross-entropy
  - explain stable softmax and global gradient clipping
  - compare SGD, momentum, and AdamW parameter updates
prerequisites:
  - vectors-matrices-linear-layers
---

# Losses and optimisers

The previous lesson produced a vector of unrestricted numbers. A classifier can use one of those numbers for each possible class, but it still needs a way to turn the scores into probabilities, measure error against the correct class, and update its parameters.

This lesson uses the gradient and parameter ideas from lessons 1 and 2 and the linear layer from lesson 3. No prior probability knowledge is assumed.

## From class scores to one loss

Suppose the possible classes are `cat`, `dog`, and `fox`.

- **Class:** one possible category, such as `dog`.
- **Logit:** an unrestricted score for one class; it is not yet a probability.
- **Probability:** a number from `0` to `1`; all class probabilities sum to `1`.
- **Target:** the class that the training example says is correct.
- **Loss:** one number measuring how poorly the probabilities match that target.
- **Optimiser:** the rule that converts parameter gradients into parameter updates.

**Softmax** converts logits `z₀, z₁, ...` into probabilities. For class `i`,

`pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)`

`exp` makes every term positive, and division by their sum normalises the result. A larger relative logit gets a larger probability. Softmax still assigns some probability to every class.

For one target class, **cross-entropy loss** is mathematically:

`L = −ln(p_target)`

Here `ln` is the natural logarithm. The loss approaches `0` as the target probability approaches `1`, and grows when the model gives the target a small probability. This probability formula explains the quantity, but robust code computes the same loss directly from logits so an extremely small target probability cannot round down to exactly zero before `ln` is applied.

## A fully worked classification

Choose logits `[ln 2, 0, 0]`. These values are convenient because `exp(ln 2) = 2` and `exp(0) = 1`:

1. Exponentials: `[2, 1, 1]`.
2. Sum: `2 + 1 + 1 = 4`.
3. Probabilities: `[2/4, 1/4, 1/4] = [0.5, 0.25, 0.25]`.
4. If `dog` is the target at index `1`, loss is `−ln(0.25) = ln 4 ≈ 1.386`.

The model currently prefers `cat`, so its loss for a `dog` example is larger than if it had assigned `dog` most of the probability.

## Predict before training

Use the formulas above to reason about relative logits. For the offset question, consider what happens to every exponential in the numerator and denominator; do not rely on a calculator evaluating `exp(1000)` successfully.

> **Predict:** If the target is `dog`, what happens to the loss when only the dog logit increases? What happens if the same `+1000` offset is added to every logit?

:::explorable{src="../explorables/losses-optimisers/index.ts" title="Linear classifier loss and optimiser arena" height="690" id="optimiser-lab"}
Train a three-class linear classifier using SGD, momentum, or AdamW. The arena shows logits, probabilities, cross-entropy, gradient and update norms, optimiser state, and loss history. A shared logit offset demonstrates stable softmax; broken modes expose numerical overflow and the loss of optimiser memory.
:::

## Explain the probability mechanism

Increasing only the dog logit increases the dog probability and lowers cross-entropy when dog is the target. It also reduces the other probabilities because all three share one denominator.

Adding a common constant `c` to every logit should change nothing:

`exp(zᵢ + c) / Σⱼ exp(zⱼ + c) = exp(c)exp(zᵢ) / [exp(c)Σⱼ exp(zⱼ)]`

The common `exp(c)` cancels. A computer can overflow before performing that cancellation, however. **Stable softmax** first subtracts the largest logit `m` from every logit:

`pᵢ = exp(zᵢ − m) / Σⱼ exp(zⱼ − m)`

At least one shifted logit is `0` and none is positive, so its exponentials stay within a manageable range. Subtracting `m` is a shared offset and therefore preserves the intended probabilities and loss.

Stable softmax prevents overflow, but a very unlikely class can still underflow to a displayed probability of exactly `0`. Taking `−ln(0)` would incorrectly produce infinity even though finite logits have a finite cross-entropy. Compute the loss with the shifted **log-sum-exp** identity instead:

`L = ln(Σⱼ exp(zⱼ − m)) − (z_target − m)`, where `m = max(z)`

For logits `[0, −1000]` and target index `1`, the shifted exponential sum is effectively `1`, while the shifted target logit is `−1000`, so the loss is approximately `1000` rather than infinity. The softmax display and the loss calculation may reuse shifted logits, but loss must not be calculated by taking the logarithm of an already rounded probability.

For softmax followed by cross-entropy, the derivative with respect to each logit has a compact form:

- target class: `pᵢ − 1`;
- every other class: `pᵢ`.

The target gradient is negative unless its probability is already `1`, so gradient descent raises that logit. Non-target gradients are positive, so gradient descent lowers them. Backpropagation carries these logit gradients through the linear layer to its weights and biases.

## Stress the invariants

Set the shared logit offset to `1000`. Stable softmax produces the same probabilities and loss because adding one constant does not change relative logits. Enable naive softmax: direct exponentiation overflows even though the underlying distribution is ordinary.

Choose momentum and take several steps, then reset optimiser state on every step. The model still follows the current gradient, but it can no longer accumulate a direction across updates.

To compare optimisers fairly, reset the model before each run, keep the target, learning rate, clipping norm, and weight decay unchanged, and record the first update norm and several loss values. The first step shows how each rule scales the same initial gradient; later steps reveal the effect of retained state.

## How an optimiser changes parameters

All three choices move parameters in a direction derived from the gradient, but they retain different information:

- **SGD (stochastic gradient descent):** uses the current example's gradient.
- **Momentum:** uses a running average of recent gradients.
- **AdamW:** uses running averages of gradients and squared gradients, with scale adjustment and
  decoupled weight decay.

In this lesson's momentum convention, the stored velocity is

`v_t = βv_(t−1) + (1 − β)g_t`

where `t` names the current training step, `g_t` is its gradient, and `β` (beta) controls how slowly memory fades. If `v_(t−1) = 0.2`, `g_t = 1`, and `β = 0.8`, then `v_t = 0.8(0.2) + 0.2(1) = 0.36`. Resetting state would instead discard the `0.16` carried from earlier steps. AdamW likewise needs its moment estimates and step count to survive between calls.

**Weight decay** applies a separate shrinkage based on the current parameter value. “Decoupled” means this shrinkage is added to the update rather than mixed into the loss gradient before the adaptive scaling.

## Global gradient clipping

A gradient can contain many components, so its overall size is measured with the Euclidean norm:

`||g|| = √(g₀² + g₁² + ...)`

If that norm exceeds a chosen maximum, **global-norm clipping** multiplies every component by the same scale. For `g = [6, 8]`, the norm is `10`. With a maximum norm of `5`, the scale is `5/10 = 0.5`, producing `[3, 4]`. The size is capped while the direction is preserved.

This differs from clipping each component independently, which can rotate the gradient. It also differs from permanently lowering the learning rate: clipping directly rescales only gradients whose norm exceeds the threshold, while the learning rate scales every immediate update. In a stateful optimiser, a clipped gradient can still affect moment estimates and therefore influence later updates.

## Bridge the training step to code

Keep the pipeline explicit when you inspect the exercise:

1. shift logits by their maximum before computing exponentials for probabilities;
2. validate the target and compute cross-entropy directly from shifted logits with log-sum-exp;
3. measure the norm of the complete gradient vector and, only if needed, apply one shared scale;
4. combine the clipped gradient with the optimiser's previous state; and
5. return both the new parameters and the new state for the next call.

Check array lengths, finite values, positive rates and clipping thresholds, and valid target indices before trusting the arithmetic. The previous optimiser state is an input with meaning, not temporary scratch space that can be recreated on every call.

:::exercise{path="../exercises/losses-optimisers" command="pnpm exec vitest run exercises/losses-optimisers/tests --config vitest.exercise.config.ts" title="Implement stable loss and a momentum update"}
Implement stable softmax, cross-entropy, global-norm clipping, and a stateful momentum update with decoupled weight decay. The starter exponentiates raw logits, clips components independently, and forgets its previous velocity.
:::

Common failure modes to look for:

- treating logits as though they already sum to one;
- computing softmax from raw large logits and producing infinity or `NaN`;
- taking `−ln` of an underflowed target probability instead of computing log-sum-exp from logits;
- clipping each component independently instead of scaling the whole vector;
- recreating momentum or AdamW state inside every update;
- applying adaptive scaling to weight decay instead of keeping it decoupled; and
- assuming the optimiser can repair an invalid loss or non-finite gradient.

## In real models

Released models combine the same next-token cross-entropy objective with carefully chosen optimisation, precision, clipping, and scheduling rules. Model-specific courses compare those published choices only after fixing the objective and numerical invariants established here.

## Recap and self-check

You should now be able to trace this chain:

`input → logits → probabilities → target loss → gradients → clipped gradients → optimiser state and parameter update`

As a quick check, explain why logits `[1002, 1001, 999]` describe the same probabilities as `[2, 1, −1]`, then decide which intermediate calculation would fail in a naive implementation. Separately, explain why two gradient vectors with the same norm can still point in different directions.

## Explain and transfer

Why can two optimisers receiving the same gradient make different updates? Why does clipping one unusually large gradient differ from permanently lowering the learning rate? Later, the next-token objective will apply the same cross-entropy calculation at every sequence position.
