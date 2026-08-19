---
id: gradient-descent
title: Gradient descent
order: 1
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Record your prediction"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "Will a rate of 1.1 make the distance from the minimum shrink, stay fixed, or grow—and will θ cross the minimum?"
  - { id: experiment, title: "Run and save the gradient-step experiment", phase: experiment, completion: explorable-event, instanceId: gradient-stepper, event: experiment-recorded }
  - { id: implement, title: "Attempt the exercise and run its tests", phase: apply, completion: learner }
  - id: explain
    title: "Explain the result and one failure mode"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "What evidence confirmed or changed your model, and where does it fail?"
objectives:
  - interpret a gradient as local slope
  - predict how learning rate changes convergence
  - implement and debug one update step
---

# Gradient descent

You need only ordinary arithmetic and the idea that a graph can slope up or down for this lesson. We will build the vocabulary used throughout the course before asking a model to learn one number.

## The smallest possible learning problem

A **model** is a rule that turns an input into a prediction. Real models may have billions of adjustable numbers, but our first model ignores inputs and predicts just one number, `θ` (the Greek letter theta).

- **Parameter:** `θ`, the adjustable number stored by the model.
- **Prediction:** the model's output, also `θ`.
- **Target:** the desired output, `3`.
- **Error:** prediction minus target, `θ − 3`.
- **Loss:** one number measuring how wrong the prediction is, `L(θ) = (θ − 3)²`.

Squaring makes the loss non-negative and penalises larger errors more. At `θ = 3`, prediction and target match, so the loss is `0`. The point `θ = 3` is therefore the **minimum** of the bowl-shaped loss curve.

**Training** means using targets and loss to adjust parameters. **Inference** means using the trained, fixed parameters to make predictions; it does not include an update and usually does not have the answer available as a target.

## How one training step is chosen

The **slope** says how the loss changes if `θ` moves slightly to the right. In one dimension that slope is also called the **gradient**. For this loss,

`gradient = 2(θ − 3)`

- Left of `3`, the gradient is negative: moving right lowers the loss.
- Right of `3`, the gradient is positive: moving left lowers the loss.
- At `3`, the gradient is zero: this loss has reached its minimum.

Gradient descent moves opposite the slope:

`next θ = current θ − learning rate × gradient`

The **learning rate** is a positive number chosen before training. It controls how much of the suggested move to take; unlike `θ`, it is a setting (often called a **hyperparameter**) rather than a parameter learned in this example.

Here is a complete small step with `θ = 1` and learning rate `0.25`:

1. Prediction: `1`; target: `3`.
2. Loss: `(1 − 3)² = 4`.
3. Gradient: `2(1 − 3) = −4`.
4. Next parameter: `1 − 0.25(−4) = 2`.
5. New loss: `(2 − 3)² = 1`, lower than `4`.

The negative gradient did not mean the model was doing badly. It meant the downhill direction was toward larger values of `θ`.

## Predict, then experiment

Now consider a much larger learning rate. Do not run all four steps on paper; use the update rule and the first step to decide whether the distance from `3` is likely to shrink.

> **Predict:** Starting at θ = −4, will a learning rate of 1.1 make the distance from the minimum shrink, stay fixed, or grow? Will θ remain on one side or cross the minimum? Write down your reason before taking a step.

:::explorable{src="../explorables/gradient-descent/index.ts" title="Gradient descent loss curve and stepper" height="470" id="gradient-stepper"}
The curve is a bowl with its minimum at θ = 3. Choose a learning rate, run four steps, and save the result. The controls expose θ, loss, gradient, and step history so two runs can be compared.
:::

## Explain what you observed

Try a small rate such as `0.2`, save the run, and compare it with `1.1`. At `1.1`, the parameter crosses the minimum on every step, and each crossing lands farther away:

- **Start:** `θ = −4.000`, error `−7.000`, loss `49.000`.
- **Step 1:** `θ = 11.400`, error `8.400`, loss `70.560`.
- **Step 2:** `θ = −7.080`, error `−10.080`, loss `101.606`.
- **Step 3:** `θ = 15.096`, error `12.096`, loss `146.313`.
- **Step 4:** `θ = −11.515`, error `−14.515`, loss `210.691`.

This run **diverges by oscillating**. Crossing the minimum is not itself a failure: with a smaller rate, the parameter can cross repeatedly while its distance shrinks.

The mechanism becomes especially clear if `e = θ − 3` is the current error. Substituting the gradient into the update gives:

`next error = (1 − 2 × learning rate) × current error`

For a rate of `1.1`, the multiplier is `−1.2`. The minus sign flips sides; the magnitude `1.2` enlarges the distance by 20% each time. For this particular quadratic loss:

- rates between `0` and `0.5` approach the minimum without crossing it;
- `0.5` reaches the minimum in one step;
- rates between `0.5` and `1` cross it but still converge;
- `1` repeats at the same distance; and
- rates above `1` diverge while alternating sides.

Those cut-offs belong to this simple bowl. Other loss surfaces have different safe scales, which is why learning-rate choice remains an empirical part of model training.

## Bridge the mathematics to code

In the exercise, connect each mathematical role to a program value:

- `parameter` is the current `θ`;
- `2 * (parameter - 3)` is the local slope at that value;
- `learningRate` scales the move; and
- the returned number is the parameter for the next step.

Before editing the central function, trace one call on paper and check whether the returned value should be smaller or larger. The exercise's public contract also requires a positive, finite learning rate. This separates the arithmetic mistake from invalid rate handling without giving up the core implementation task.

## Debug the update

Set the rate to `1.1` and take four steps. The failure is not a wrong gradient: the step size amplifies the distance after each sign change.

:::exercise{path="../exercises/gradient-descent" command="pnpm exec vitest run exercises/gradient-descent/tests --config vitest.exercise.config.ts" title="Implement one gradient update"}
Implement one guarded update step using the loss gradient. The starter intentionally uses the gradient sign incorrectly. Add one test derived from an experiment you saved above.
:::

Common failure modes to look for:

- adding the scaled gradient instead of moving against it;
- assuming every negative gradient means `θ` itself should become negative;
- checking only that one step moved, rather than that the loss fell;
- accepting `0`, negative, `NaN`, or infinite learning rates; and
- blaming the gradient formula when a valid but excessive rate diverges.

## In real models

Frontier-model training still reduces loss through parameter updates, even when the optimiser, parameter groups, schedules, clipping, and distributed system are far more elaborate. The planned Kimi case study starts from this invariant before comparing AdamW with a Muon-inspired matrix update.

## Recap and self-check

You should now be able to explain, without the explorable:

1. how a model, parameter, prediction, target, and loss differ;
2. why training updates parameters but inference does not;
3. what the sign and size of a one-dimensional gradient say; and
4. how a learning rate can produce steady convergence, converging oscillation, or divergence.

As a quick check, calculate one step from `θ = 5` with learning rate `0.25`, then verify that its loss is lower. If you cannot explain the direction before calculating, revisit the slope signs above.

## Explain and transfer

Why does multiplying every gradient by a constant resemble changing the learning rate? What stops that equivalence in an adaptive optimiser?
