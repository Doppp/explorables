---
id: inference-generation-reasoning
title: Inference, generation, and reasoning
order: 6
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Separate running, generating, and reasoning"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "If a chat product calls a model, runs a calculator, then calls the model again, which work belongs to model inference and which belongs to the surrounding product?"
  - { id: experiment, title: "Inspect and save one problem-solving path", phase: experiment, completion: explorable-event, instanceId: reasoning-path, event: experiment-recorded }
  - { id: apply, title: "Classify four system activities", phase: apply, completion: learner }
  - id: reflect
    title: "Explain the boundaries"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "Distinguish inference, generation, and reasoning, and explain why fluent step-by-step text is not proof of correctness or a faithful private computation trace."
objectives:
  - distinguish inference from repeated generation
  - describe reasoning as problem-solving behaviour that may span model and product work
  - avoid treating generated explanations as proof of private computation or correctness
---

# Inference, generation, and reasoning

The words **inference**, **generation**, and **reasoning** describe related but different activities.

## Words for this step

**Inference** means using a model with its current parameters to produce a prediction or output.
Ordinary inference does not update those parameters. In logic, inference can mean drawing a
conclusion; in this course, the unqualified term normally means running a trained model.

**Generation** means constructing content through one or more inference steps. A language model can
score a next token, the product can select it, and the loop can repeat to construct text.

**Reasoning** means using intermediate relationships or steps to reach an answer. In an AI product,
problem-solving behaviour may involve model inference, repeated model calls, instructions, search,
code execution, a calculator, or other tools.

## A worked product path

Consider the question `What is 17 × 24?`:

1. The product calls the language model: model inference.
2. The model proposes using a calculator: generated output.
3. The product runs the calculator: product tool work.
4. The product supplies `408` to the model: a second inference input.
5. The model generates the final explanation: repeated inference and generation.

The full path demonstrates structured problem-solving behaviour. It is not all computation inside
one model call.

> **Predict:** Which steps above belong to model inference, and which belong to the surrounding
> product?

:::explorable{src="../explorables/reasoning-path/index.ts" title="Inspect model and product responsibilities in a reasoning path" height="470" id="reasoning-path"}
Choose a system activity and inspect whether it runs the model, constructs content, performs product
tool work, or supplies evidence that can be checked.
:::

## Generated explanations are evidence to check

A model can produce fluent step-by-step text containing a false assumption or arithmetic error.
That text is generated output. It is not guaranteed to be a complete or faithful transcript of
private internal computation, and fluency is not proof of correctness. Check results against the
problem, tool evidence, tests, or other appropriate sources.

## Recap

- Inference runs a model with its current parameters.
- Generation constructs content through one or more inference steps.
- Reasoning describes a problem-solving process or behaviour and may span model and product work.
- A generated explanation can help inspection, but it is not proof of correctness.
