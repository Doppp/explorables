---
id: bpe-tokenisation
title: BPE tokenisation
order: 5
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Run one BPE merge", completion: explorable-event, instanceId: bpe-workbench, event: simulation-completed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - count adjacent token pairs
  - apply one BPE merge consistently
  - explain how merge order changes a vocabulary
---

# BPE tokenisation

Byte-pair encoding repeatedly merges a frequent adjacent pair. The algorithm is simple; its behaviour comes from applying each learned merge everywhere.

> **Predict:** In `low lower lowest`, which pair is most frequent before any merge? How many occurrences do you count?

:::explorable{src="../explorables/bpe/index.ts" title="Step-by-step BPE merge workbench" height="520" id="bpe-workbench"}
Words begin as character tokens plus an end marker. The workbench lists pair counts, highlights the most frequent pair, and applies one merge at a time. A deliberate “first occurrence only” mode demonstrates an inconsistent merge.
:::

## Break consistency

Enable the broken mode for one step. Pair counts now describe a corpus that does not correspond to the learned merge rule.

:::exercise{path="../exercises/bpe" command="pnpm exec vitest run exercises/bpe/tests --config vitest.exercise.config.ts" title="Count and merge token pairs"}
Implement deterministic pair counting and a non-overlapping merge. The starter counts only one occurrence per word.
:::

## In real models

Real releases publish a tokenizer and vocabulary alongside the weights because token IDs are part of the model contract. Configuration comparisons must not treat vocabulary size, byte handling, or special-token conventions as incidental metadata.

## Explain and transfer

Why can two tokenisers trained on the same text learn different vocabularies when ties are broken differently?
