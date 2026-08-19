---
id: introduction
title: Introduction
objectives:
  - connect an interactive value to an implementation
discoveryCycle: true
checkpoints:
  - id: predict
    title: Record your prediction
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: What output do you expect for an input of 4, and why?
  - id: experiment
    title: Save a doubling experiment
    phase: experiment
    completion: explorable-event
    instanceId: doubling-explorer
    event: experiment-recorded
  - id: implement
    title: Attempt the exercise and run its tests
    phase: apply
    completion: learner
  - id: explain
    title: Explain the result and one failure mode
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: What rule fits your evidence, and where should invalid input be rejected?
---

# Introduction

A **function** accepts an input and returns an output. This lesson uses a doubling function: it
multiplies every finite input by `2`. The input `3`, for example, produces `3 × 2 = 6`.

The important contract is not just one remembered answer. The same rule must work for positive,
negative, and fractional inputs, while the program must decide what to do with values such as
`Infinity` that are not finite.

> **Predict:** What output do you expect for an input of 4, and which single rule supports your
> prediction?

:::explorable{src="../explorables/hello/index.ts" id="doubling-explorer" title="Doubling explorer" height="300"}
Choose an input, observe the output, and save at least two runs to infer the relationship.
:::

## Explain the evidence

Compare the saved runs. If both satisfy `output = input × 2`, one rule accounts for more than a
single example. A few matching examples do not prove the implementation handles every JavaScript
number, so the exercise tests the boundary as well as the ordinary calculation.

For an input named `value`, the implementation responsibility is:

1. decide whether `value` belongs to the accepted input domain;
2. calculate the result using the inferred rule; and
3. return that result without changing unrelated state.

:::exercise{path="../exercises/double" command="pnpm test" title="Implement double"}
Implement the doubling function and run its tests.
:::

## Explain

Why is “the example returned 8” weaker evidence than “the same rule explains all of my saved
runs”? Where should invalid numeric input be rejected?

## Recap

- A function maps an input to an output according to a rule.
- Examples provide evidence for a rule; tests probe ordinary cases and boundaries.
- The explorable reveals behavior, while the exercise makes that behavior explicit in code.
