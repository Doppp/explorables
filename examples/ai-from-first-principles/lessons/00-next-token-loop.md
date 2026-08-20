---
id: next-token-loop
title: The next-token loop
order: 2
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Predict the next-token process"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "If a model assigns 55% to ‘sat’, 30% to ‘slept’, and 15% to ‘purred’, must it always choose ‘sat’? What becomes the next input?"
  - { id: experiment, title: "Generate and save one token", phase: experiment, completion: explorable-event, instanceId: next-token-loop, event: experiment-recorded }
  - { id: apply, title: "Trace two generation steps", phase: apply, completion: learner }
  - id: reflect
    title: "Explain how prediction becomes generation"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "Explain how tokens, next-token probabilities, selection, and the growing context turn one prediction into generated text."
objectives:
  - explain tokens and next-token probability distributions in plain language
  - trace autoregressive generation as repeated prediction and selection
  - distinguish model probabilities from the decoding rule that selects a token
---

# The next-token loop

An LLM chat response looks like a paragraph arriving on screen, but the model produces it through a
small repeated operation. Seeing the full loop first gives the later Transformer machinery a job to
explain.

## From text to tokens

A **token** is an item from the model's finite vocabulary. It may be a whole short word, part of a
word, punctuation, whitespace, or a byte-level piece. A **tokenizer** converts visible text into
token identifiers before the model runs and converts generated identifiers back into text.

Given the tokens so far—the **context**—the model outputs one score for every possible next token.
After normalisation, those scores form a **probability distribution**: every probability is at least
zero and together they add to one.

The model does not output a finished paragraph in one operation. A separate **decoding rule**
selects one token from the distribution. The selected token is appended to the context, and the
longer context is sent through the model for the next step. This is **autoregressive generation**:
the system repeatedly uses its own earlier output as later input.

`context → next-token probabilities → select one token → append → repeat`

> **Predict:** If `sat` has probability 55%, `slept` 30%, and `purred` 15%, must generation always
> choose `sat`? After one token is selected, what exact information changes before the next step?

:::explorable{src="../explorables/next-token-loop/index.ts" title="Step through autoregressive next-token generation" height="500" id="next-token-loop"}
Start with “The cat.” Inspect the next-token probabilities, generate exactly one token, and observe
that the selected token becomes part of the next context and produces a new distribution.
:::

## Explain the evidence

At the first step the context is `The cat`. The tiny model assigns probabilities to `sat`, `slept`,
and `purred`. Selecting `sat` produces `The cat sat`. That entire growing sequence—not only the last
token—defines the context for the next prediction, whose likely candidates now include `on` and a
period.

The most probable token need not always be chosen. Greedy decoding always takes the maximum;
sampling uses the probabilities to allow lower-ranked candidates. The model supplies scores. The
decoding algorithm decides how a token is selected from them. A later lesson makes temperature,
top-k, and top-p explicit.

## Trace two steps

With your tutor, write a four-column trace: current context, candidate distribution, selected token,
and new context. Generate twice and fill one row per click. Identify which column is the model's
output and which operation belongs to the surrounding generation loop.

## What this tiny loop leaves out

This explorable uses a handwritten lookup table so the loop is deterministic and inspectable. A
real LLM calculates its scores with learned embeddings, attention, feed-forward layers, and many
parameters. Modern product capability also depends on training data, scale, post-training,
evaluation, tools, retrieval, and instructions. Learning the tiny mechanism is the start of the
explanation, not a claim that architecture alone explains intelligence.

## Recap

You are ready to ask how the probabilities improve when you can explain why generation is repeated
next-token prediction, why the context grows after every selection, and why the model and decoding
rule have different responsibilities.
