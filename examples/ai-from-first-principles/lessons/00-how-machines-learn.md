---
id: how-machines-learn
title: How machines learn
order: 3
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Predict what training changes"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "Which value should training change: the input, the target, or the model parameter—and should inference change it too?"
  - { id: experiment, title: "Run and save one learning step", phase: experiment, completion: explorable-event, instanceId: learning-loop, event: experiment-recorded }
  - { id: trace, title: "Trace a second example yourself", phase: apply, completion: learner }
  - id: explain
    title: "Explain training versus inference"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "In your own words, how do prediction, target, loss, and parameter update form a training loop, and what is missing during inference?"
objectives:
  - distinguish a model from the data it processes
  - explain prediction, target, loss, parameter, training, and inference
  - trace one small learning loop before meeting gradient descent
---

# How machines learn

This course starts with the machinery behind modern language models, but it does not assume that you already know machine-learning vocabulary. This lesson builds one small mental model that the rest of the course will repeatedly extend.

## What “AI” means in this course

**Artificial intelligence** is a broad label for computer systems that perform tasks associated with perception, language, reasoning, prediction, or decision-making. Some AI systems are written as explicit rules. A **machine-learning model** instead contains adjustable values that are learned from examples.

A language model is one kind of machine-learning model. Given a sequence of text pieces called tokens, it predicts what token could come next. A real language model contains many adjustable values and layers, but its training still follows the same basic loop we can inspect with one number.

## The six pieces of a learning loop

For now, imagine a model whose entire prediction is one adjustable number.

1. **Input:** information given to the model. Our smallest model ignores its input; later models will use tokens and vectors.
2. **Parameter:** a value stored inside the model that training is allowed to change.
3. **Prediction:** the output produced from the current input and parameters.
4. **Target:** the answer supplied by training data.
5. **Loss:** one number measuring how far the prediction is from the target.
6. **Update:** a change to the parameter intended to reduce future loss.

The model is the rule plus its parameters. The target is not part of the model: it is evidence available while training.

## Training and inference are different activities

During **training**, the system has an example and its target. It predicts, measures loss, and updates parameters:

`example → prediction → compare with target → loss → parameter update`

During **inference**, the trained parameters are held fixed. The system receives an input and produces a prediction without being given the correct target:

`new input → prediction`

Inference can be repeated many times without teaching the model anything. A conversation with a deployed language model normally runs inference; the model does not retrain its stored weights after each message.

## How this course works

Each technical lesson follows the same learning rhythm:

- read the setup and definitions;
- record a prediction before seeing the result;
- manipulate an explorable and save evidence;
- connect the evidence to code or a hand-worked example; and
- explain the result and one way it can fail.

Checkpoints save progress in this browser. They are not grades. Coding exercises live in the repository so you can inspect real files and run tests with your coding agent.

## Predict before changing anything

Suppose the model parameter is `−1`, so its prediction is also `−1`, while the training target is `3`.

> **Predict:** Which value should training change: the input, the target, or the model parameter? Should running inference on the same model change that value too? Give a reason before using the controls.

:::explorable{src="../explorables/learning-loop/index.ts" title="A one-parameter training and inference loop" height="430" id="learning-loop"}
Choose a starting parameter and target. Training reveals the target, measures error, changes the parameter, and saves evidence. Inference produces the current prediction without a target or update.
:::

## Explain the evidence

With a starting parameter of `−1` and target `3`, the model first predicts `−1`. The difference `target − prediction` is `4`. Our introductory update moves halfway across that error:

1. Starting parameter and prediction: `−1`.
2. Target: `3`.
3. Squared loss: `(−1 − 3)² = 16`.
4. Adjustment: `0.5 × 4 = 2`.
5. Updated parameter: `−1 + 2 = 1`.
6. New loss: `(1 − 3)² = 4`.

The parameter changed and the loss fell. The input and target did not become learned parameters. If you press **Run inference only**, the model returns its current parameter as a prediction and leaves that parameter unchanged.

This example deliberately chooses an adjustment that moves toward the target. The next lesson asks the harder question: how can a system calculate a useful update direction rather than having one handed to it? That method is gradient descent.

## Trace a second example

Choose a starting parameter of `5` and a target of `1`. Before training, write down the prediction, the signed error `target − prediction`, the halfway adjustment, and the expected new parameter. Run one step and compare every value.

A useful explanation must distinguish the sign of the error from whether the model is “good” or “bad.” The sign only identifies which direction the parameter needs to move in this one-number example.

## Failure boundaries

This tiny loop is not yet a realistic learning algorithm:

- it assumes that moving halfway toward the target is always valid;
- it has only one parameter and ignores inputs;
- it uses one example at a time;
- it does not explain how a model with many connected parameters assigns responsibility for error; and
- a deployed model performing inference does not have the target needed to repeat this update.

Gradient descent, backpropagation, vectors, and the later Transformer lessons will replace these simplifications one at a time.

## Recap and self-check

You are ready to continue when you can explain:

1. why a parameter belongs to the model but a target belongs to training data;
2. why loss is a measurement rather than the prediction itself;
3. why training may change parameters while inference normally does not; and
4. how the same loop can apply to a one-number model and, at a much larger scale, a language model.
