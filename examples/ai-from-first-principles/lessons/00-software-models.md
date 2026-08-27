---
id: software-models
title: Inputs, outputs, rules, and learned models
order: 2
discoveryCycle: true
checkpoints:
  - id: check-words
    title: "Recognise the software words"
    phase: check
    completion: learner
    response:
      format: short-text
      prompt: "In the photo application example, what is the input and what is the visible output?"
  - id: predict
    title: "Identify what can change"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "A programmer writes a fixed file-extension rule, while training adjusts numbers in a photo model. Which behaviour can training change?"
  - { id: experiment, title: "Inspect and save one software path", phase: experiment, completion: explorable-event, instanceId: software-pipeline, event: experiment-recorded }
  - { id: apply, title: "Name each component's responsibility", phase: apply, completion: learner }
  - id: reflect
    title: "Explain rules versus learned behaviour"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "Explain input, output, component, rule, model, and learned model using the photo example."
objectives:
  - identify inputs, outputs, and components in a familiar application
  - distinguish a programmer-written rule from learned model behaviour
---

# Inputs, outputs, rules, and learned models

Before discussing AI categories, separate the ordinary software responsibilities in a familiar
application.

## Words for this step

An **input** is information supplied to a program. An **output** is information the program returns.
A **component** is one part of a larger program with a particular responsibility.

Suppose a photo application receives `dog.jpg`:

1. The photo file is the input.
2. A decoder component turns file bytes into pixel values.
3. A photo model receives those values and predicts `dog`.
4. The interface component displays `dog` as the output.

The upload button and interface are not the photo model. They are other components in the same
product.

## Rules and learned models

A **rule** directly specifies behaviour, such as “if the filename ends in `.jpg`, display
`photo file`.” A **model** is a component that converts an input into a prediction or output. A
**learned model** has adjustable numbers called parameters whose values were shaped using examples.

Training can adjust the model's parameters. It does not silently rewrite the fixed file-extension
rule.

> **Predict:** A programmer writes the file-extension rule, while training adjusts the photo
> model's parameters. Which behaviour can training change?

:::explorable{src="../explorables/software-pipeline/index.ts" title="Inspect a photo application's software path" height="430" id="software-pipeline"}
Choose a component in the photo application. The panel identifies its input, responsibility, and
output, and whether its behaviour is directly programmed or learned from examples.
:::

## Explain the evidence

The application is a pipeline of components. Only the model path has learned parameters in this
example. “Uses AI” does not turn every surrounding component into a model.

## Recap

Explain why `dog.jpg` can be an input to the complete product while pixel values are the input to
one component inside that product.
