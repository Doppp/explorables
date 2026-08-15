---
id: introduction
title: Introduction
objectives:
  - connect an interactive value to an implementation
checkpoints:
  - id: predict
    title: Record your prediction
    completion: learner
  - id: experiment
    title: Move the doubling control
    completion: explorable-event
    instanceId: doubling-explorer
    event: parameter-changed
  - id: implement
    title: Attempt the exercise and run its tests
    completion: learner
  - id: explain
    title: Explain the result and one failure mode
    completion: learner
---

# Introduction

> **Predict:** What will the output be when the input is 4?

:::explorable{src="../explorables/hello/index.ts" id="doubling-explorer" title="Doubling explorer" height="300"}
The input is doubled. An input of 4 produces an output of 8.
:::

:::exercise{path="../exercises/double" command="pnpm test" title="Implement double"}
Implement the doubling function and run its tests.
:::

## Explain

Where should invalid numeric input be rejected?
