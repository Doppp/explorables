---
id: bpe-tokenisation
title: BPE tokenisation
order: 3
objectives:
  - count adjacent token pairs
  - apply one BPE merge consistently
  - explain how merge order changes a vocabulary
---

# BPE tokenisation

Byte-pair encoding repeatedly merges a frequent adjacent pair. The algorithm
is simple; its behaviour comes from applying each learned merge everywhere.

> **Predict:** In `low lower lowest`, which pair is most frequent before any
> merge? How many occurrences do you count?

:::explorable{src="../explorables/bpe/index.ts" title="Step-by-step BPE merge workbench" height="520"}
Words begin as character tokens plus an end marker. The workbench lists pair
counts, highlights the most frequent pair, and applies one merge at a time. A
deliberate “first occurrence only” mode demonstrates an inconsistent merge.
:::

## Break consistency

Enable the broken mode for one step. Pair counts now describe a corpus that
does not correspond to the learned merge rule.

:::exercise{path="../exercises/bpe" command="pnpm exec vitest run exercises/bpe/tests --config vitest.exercise.config.ts" title="Count and merge token pairs"}
Implement deterministic pair counting and a non-overlapping merge. The starter
counts only one occurrence per word.
:::

## Explain and transfer

Why can two tokenisers trained on the same text learn different vocabularies
when ties are broken differently?
