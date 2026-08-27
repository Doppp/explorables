---
id: ai-from-first-principles
title: AI from First Principles
version: 0.7.0-ai-101.1
summary: Learn, inspect, implement, and debug the foundations behind modern language models.
license: CC-BY-4.0
audience:
  - software developers new to machine learning
  - technical learners comfortable reading code
prerequisites:
  - basic programming and terminal use
  - ordinary arithmetic and arrays
  - no prior machine-learning or calculus knowledge
estimatedHours: 20
repository: https://github.com/Doppp/explorables
language: en
tags:
  - machine-learning
  - language-models
teaching:
  mode: tutor-led
guidance:
  defaultMode: guided
  allowExploreMode: true
  allowSkipping: true
  persistLocally: true
---

# AI from First Principles

This course assumes that you can read basic code, use arrays, and work in a terminal. It does not
assume that you already know AI or machine-learning terminology. Each important term is introduced
with a concrete example before a checkpoint asks you to use it. Predictions are starting guesses,
not grades. If a word is unclear, stop and ask the tutor to explain that word before continuing.

Start with the words used to describe software and learned models. Then locate classification,
generation, language models, chat products, training, inference, and reasoning before meeting the mathematical
machinery. The coding agent teaches and adapts the active checkpoint in conversation. The browser
is the adjacent workbench for predictions, manipulation, evidence, and durable reference notes.

## What you will learn

You will build a language model from the operations beneath it: learning from examples, calculating
updates, representing text as numbers, mixing information with attention, training a Transformer,
and generating and evaluating outputs. Every new term is introduced before a checkpoint asks you
to use it.

## How to use the course

Ask the coding-agent tutor to introduce the active checkpoint. Answer its prediction in chat, use
the browser explorable to generate evidence, then return to conversation to explain what happened.
Open the browser's reference notes whenever you want the canonical definitions or worked example.
Guided checkpoints remain local to this browser and are not grades.

Use [the course glossary](GLOSSARY.md) to revisit the canonical beginner definition of a term. The
lesson that first uses a term still explains it in context, so the glossary is a review aid rather
than a prerequisite reading assignment.

## Lessons

1. [Start with the words](lessons/00-course-language.md)
2. [Inputs, outputs, rules, and learned models](lessons/00-software-models.md)
3. [Generative AI and language models](lessons/00-generative-ai-and-llms.md)
4. [The next-token loop](lessons/00-next-token-loop.md)
5. [How machines learn](lessons/00-how-machines-learn.md)
6. [Inference, generation, and reasoning](lessons/00-inference-generation-reasoning.md)
7. [Gradient descent](lessons/01-gradient-descent.md)
8. [Backpropagation](lessons/02-backpropagation.md)
9. [Vectors, matrices, and linear layers](lessons/03-vectors-matrices-linear-layers.md)
10. [Losses and optimisers](lessons/04-losses-optimisers.md)
11. [BPE tokenisation](lessons/05-bpe-tokenisation.md)
12. [Embeddings and positional information](lessons/06-embeddings-positional-information.md)
13. [Self-attention](lessons/07-self-attention.md)
14. [Multi-head attention](lessons/08-multi-head-attention.md)
15. [The Transformer block](lessons/09-transformer-block.md)
16. [Next-token training](lessons/10-next-token-training.md)
17. [Autoregressive inference and KV caching](lessons/11-autoregressive-inference-kv-caching.md)
18. [Sampling and generation](lessons/12-sampling.md)
19. [Evaluation leakage](lessons/13-evaluation-leakage.md)
