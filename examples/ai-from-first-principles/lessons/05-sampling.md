---
id: sampling
title: Sampling and generation
order: 5
objectives:
  - relate logits, temperature, and probabilities
  - compare top-k with nucleus sampling
  - detect an invalid truncation order
---

# Sampling and generation

A model produces logits, not a finished answer. A decoding policy reshapes and
truncates their distribution before selecting a token.

> **Predict:** As temperature approaches zero, which token dominates? Does a
> top-p threshold of 0.8 always keep the same number of tokens?

:::explorable{src="../explorables/sampling/index.ts" title="Temperature, top-k, and top-p sampler" height="560"}
Edit four logits, then change temperature, top-k, and top-p. Probability bars
show the surviving normalised distribution. A broken top-p ordering keeps
tokens in vocabulary order instead of probability order.
:::

## Reveal the ordering bug

Enable the broken top-p order. Change logits so the highest probability is not
the first token; the kept set now depends on vocabulary position.

:::exercise{path="../exercises/sampling" command="pnpm exec vitest run exercises/sampling/tests --config vitest.exercise.config.ts" title="Build a decoding distribution"}
Implement temperature scaling and top-p truncation with stable normalisation.
The starter accumulates tokens before sorting them.
:::

## Explain and transfer

Why can lowering temperature and lowering top-p both reduce variety while
producing different distributions?
