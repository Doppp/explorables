---
id: next-token-training
title: Next-token training
order: 10
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Take a next-token training step", completion: explorable-event, instanceId: next-token-lab, event: simulation-completed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - align each input position with the token one step to its right
  - average stable cross-entropy across valid sequence positions
  - update a small model from accumulated per-position gradients
prerequisites:
  - transformer-block
  - losses-optimisers
---

# Next-token training

An autoregressive language model reads a prefix and predicts the following token at every position. The token at position `t` is input; the token at position `t + 1` is its target. The final token in a window has no target inside that window.

> **Predict:** A model is biased to copy its current token. Will it score better against correctly shifted next-token targets or incorrectly unshifted targets?

:::explorable{src="../explorables/next-token-training/index.ts" title="Shifted next-token training laboratory" height="720" id="next-token-lab"}
Train a small token-transition model on a visible sequence. The table aligns each input with its next-token target, probability, and cross-entropy before accumulating gradients into one update. A broken unshifted mode labels every token with itself, making an identity-biased model look misleadingly accurate.
:::

## Train the stated objective

Take several correct training steps and watch mean next-token loss fall. Reset, enable the broken target alignment, and observe the much lower initial score: the model is rewarded for copying, not predicting what follows.

This transition table is deliberately smaller than a Transformer. The alignment, cross-entropy averaging, backward gradients, and update loop are the same training responsibilities the capstone will apply to Transformer logits.

:::exercise{path="../exercises/next-token-training" command="pnpm exec vitest run exercises/next-token-training/tests --config vitest.exercise.config.ts" title="Implement shifted next-token training"}
Construct shifted input-target pairs, compute stable mean cross-entropy, and apply the accumulated transition-matrix gradient. The starter uses each token as its own target.
:::

## In real models

Scaling the model or changing its attention and expert blocks does not change the causal target shift demonstrated here. Release reports may add post-training objectives, but architecture comparisons must first preserve the base language-model objective and masking contract.

## Explain and transfer

Why must causal masking and shifted targets both be correct? If masking leaks a future token, can the loss still decrease while the model learns an invalid shortcut?
