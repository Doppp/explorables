---
id: ai-from-first-principles
title: AI from First Principles
version: 0.5.0-onboarding.1
summary: Learn, inspect, implement, and debug the foundations behind modern language models.
license: CC-BY-4.0
audience:
  - software developers new to machine learning
  - technical learners comfortable reading code
prerequisites:
  - basic programming and terminal use
  - ordinary arithmetic and arrays
  - no prior machine-learning or calculus knowledge
estimatedHours: 19
repository: https://github.com/Doppp/explorables
language: en
tags:
  - machine-learning
  - language-models
guidance:
  defaultMode: guided
  allowExploreMode: true
  allowSkipping: true
  persistLocally: true
---

# AI from First Principles

Start with the course orientation and the small learning loop before meeting its mathematical
machinery. The lesson prose teaches the durable definitions, notation, and mechanisms. Use the
browser to form an intuition, then make that intuition survive experiments, code, and tests. The
coding agent adapts the explanation and helps you debug; it is your tutor, not the source of a
hidden parallel course and not your substitute.

## What you will learn

You will build a language model from the operations beneath it: learning from examples, calculating
updates, representing text as numbers, mixing information with attention, training a Transformer,
and generating and evaluating outputs. Every new term is introduced before a checkpoint asks you
to use it.

## How to use the course

Read the setup before answering each prediction. Manipulate the explorable, save evidence, then
move into the linked repository exercise when one is present. Guided checkpoints remain local to
this browser and are not grades. The coding agent can clarify the active lesson, run tests after
your attempt, and give progressively stronger hints without revealing protected solutions.

## Lessons

1. [How machines learn](lessons/00-how-machines-learn.md)
2. [Gradient descent](lessons/01-gradient-descent.md)
3. [Backpropagation](lessons/02-backpropagation.md)
4. [Vectors, matrices, and linear layers](lessons/03-vectors-matrices-linear-layers.md)
5. [Losses and optimisers](lessons/04-losses-optimisers.md)
6. [BPE tokenisation](lessons/05-bpe-tokenisation.md)
7. [Embeddings and positional information](lessons/06-embeddings-positional-information.md)
8. [Self-attention](lessons/07-self-attention.md)
9. [Multi-head attention](lessons/08-multi-head-attention.md)
10. [The Transformer block](lessons/09-transformer-block.md)
11. [Next-token training](lessons/10-next-token-training.md)
12. [Autoregressive inference and KV caching](lessons/11-autoregressive-inference-kv-caching.md)
13. [Sampling and generation](lessons/12-sampling.md)
14. [Evaluation leakage](lessons/13-evaluation-leakage.md)
