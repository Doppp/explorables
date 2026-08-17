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

> **Predict:** What will the output be when the input is 4?

:::explorable{src="../explorables/hello/index.ts" id="doubling-explorer" title="Doubling explorer" height="300"}
Choose an input, observe the output, and save at least two runs to infer the relationship.
:::

:::exercise{path="../exercises/double" command="pnpm test" title="Implement double"}
Implement the doubling function and run its tests.
:::

## Explain

Where should invalid numeric input be rejected?
