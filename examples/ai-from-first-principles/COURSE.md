---
id: ai-from-first-principles
title: AI from First Principles
version: 0.6.0-tutor-led.1
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

Start by locating generative AI, language models, and chat products on the same map. Then trace the
next-token loop and ask how training improves its probabilities before meeting the mathematical
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

## Lessons

1. [Generative AI and language models](lessons/00-generative-ai-and-llms.md)
2. [The next-token loop](lessons/00-next-token-loop.md)
3. [How machines learn](lessons/00-how-machines-learn.md)
4. [Gradient descent](lessons/01-gradient-descent.md)
5. [Backpropagation](lessons/02-backpropagation.md)
6. [Vectors, matrices, and linear layers](lessons/03-vectors-matrices-linear-layers.md)
7. [Losses and optimisers](lessons/04-losses-optimisers.md)
8. [BPE tokenisation](lessons/05-bpe-tokenisation.md)
9. [Embeddings and positional information](lessons/06-embeddings-positional-information.md)
10. [Self-attention](lessons/07-self-attention.md)
11. [Multi-head attention](lessons/08-multi-head-attention.md)
12. [The Transformer block](lessons/09-transformer-block.md)
13. [Next-token training](lessons/10-next-token-training.md)
14. [Autoregressive inference and KV caching](lessons/11-autoregressive-inference-kv-caching.md)
15. [Sampling and generation](lessons/12-sampling.md)
16. [Evaluation leakage](lessons/13-evaluation-leakage.md)
