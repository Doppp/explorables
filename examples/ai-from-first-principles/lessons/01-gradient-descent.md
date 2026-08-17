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
      prompt: "Will a rate of 1.1 converge, oscillate, or diverge—and why?"
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

We want the parameter θ to reach the minimum of `L(θ) = (θ − 3)²`.

> **Predict:** Starting at θ = −4, will a learning rate of 1.1 converge, oscillate, or diverge? Write down your reason before taking a step.

:::explorable{src="../explorables/gradient-descent/index.ts" title="Gradient descent loss curve and stepper" height="470" id="gradient-stepper"}
The curve is a bowl with its minimum at θ = 3. Choose a learning rate, run four steps, and save the result. The controls expose θ, loss, gradient, and step history so two runs can be compared.
:::

## Debug the update

Set the rate to `1.1` and take four steps. The failure is not a wrong gradient: the step size amplifies the distance after each sign change.

:::exercise{path="../exercises/gradient-descent" command="pnpm exec vitest run exercises/gradient-descent/tests --config vitest.exercise.config.ts" title="Implement one gradient update"}
Implement loss, gradient, and a guarded update step. The starter intentionally uses the gradient sign incorrectly. Add one test derived from an experiment you saved above.
:::

## In real models

Frontier-model training still reduces loss through parameter updates, even when the optimiser, parameter groups, schedules, clipping, and distributed system are far more elaborate. The planned Kimi case study starts from this invariant before comparing AdamW with a Muon-inspired matrix update.

## Explain and transfer

Why does multiplying every gradient by a constant resemble changing the learning rate? What stops that equivalence in an adaptive optimiser?
