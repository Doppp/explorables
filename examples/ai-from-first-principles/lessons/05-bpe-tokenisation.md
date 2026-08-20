---
id: bpe-tokenisation
title: BPE tokenisation
order: 8
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

The earlier lessons used numbers and vectors, but a language model cannot feed a JavaScript string such as `"lowest"` directly into a linear layer. It first needs a repeatable way to turn text into a sequence of integer identifiers. **Tokenisation** is that conversion.

## From text to model input

A few terms keep the stages separate:

- A **corpus** is the collection of text used to learn tokenisation rules.
- A **token** is one text unit produced by a tokenizer. It might be a character, byte, common word piece, whole word, or a special marker.
- A **vocabulary** is the finite list of tokens the tokenizer knows.
- A **token ID** is the integer position of a token in that vocabulary. The ID is an index, not a measurement: token ID `200` is not “twice” token ID `100`.
- A **tokenizer** applies fixed rules that convert text to token IDs and IDs back to text.

**Byte-pair encoding (BPE)** learns some of those rules by repeatedly joining frequent adjacent token pairs. Many production variants begin with bytes or byte-derived units. This lesson uses visible characters so that every step can be inspected.

The workbench also appends `</w>`, a special end-of-word marker. It lets the toy tokenizer distinguish a pair at the end of a word from the same characters inside a longer word.

## A small pair-counting example

Start with the one-word corpus `abab`. Its initial token array is:

```text
["a", "b", "a", "b", "</w>"]
```

The adjacent pairs are `a + b`, `b + a`, `a + b`, and `b + </w>`. Therefore `a + b` has count 2, not count 1. A pair count records every adjacent occurrence; it is not merely a list of which pairs appear in a word.

If the learned rule is `a + b → ab`, it must be applied consistently across the corpus. This example becomes:

```text
["ab", "ab", "</w>"]
```

After that transformation, BPE recounts pairs because the available neighbours have changed.

> **Predict:** Write the adjacent pairs in `low`, `lower`, and `lowest`, including each `</w>` pair. Which pair or pairs have the largest count? If there is a tie, which one do you expect the workbench to choose?

:::explorable{src="../explorables/bpe/index.ts" title="Step-by-step BPE merge workbench" height="520" id="bpe-workbench"}
Words begin as character tokens plus an end marker. Before merging, compare the count table with your prediction. Apply one merge and inspect every word, then reset and repeat with **Merge first occurrence only (broken)** enabled. The table uses count descending and lexical order to resolve a tie, so the same corpus always chooses the same next rule.
:::

## What the first merge reveals

Both `l + o` and `o + w` occur three times in the starting corpus. The deterministic lexical tie-break selects `l + o`, and the learned rule is applied to all three words:

```text
["lo", "w", "</w>"]
["lo", "w", "e", "r", "</w>"]
["lo", "w", "e", "s", "t", "</w>"]
```

One BPE training step therefore has four parts:

1. Count every adjacent pair in the current corpus representation.
2. Select the greatest count, using a deterministic rule for ties.
3. Replace every non-overlapping occurrence of that pair with the joined token.
4. Recount using the newly formed tokens before choosing another merge.

The ordered merge list becomes part of the tokenizer. Applying the same rules in a different order can expose different neighbours and ultimately create a different vocabulary.

## Why consistency and non-overlap matter

The broken mode learns one rule but applies it to only the first matching location. The corpus then contains both a merged `lo` and other unmerged `l`, `o` occurrences that the same rule should have transformed. Later pair counts are based on that inconsistent intermediate state.

Counting and merging have one subtle difference. In `["a", "a", "a"]`, the pair `a + a` is counted at positions 0–1 and 1–2, so its count is 2. A merge pass cannot use the middle `a` twice, however, so a left-to-right non-overlapping merge produces `["aa", "a"]`.

## From arrays to code

The toy corpus has TypeScript shape `string[][]`:

- **Corpus:** an outer array of words with `wordCount` rows.
- **Word:** the current tokens in one word, represented as `string[]`.
- **Pair counts:** pair name to occurrence count, represented as `Map<string, number>`.
- **Selected pair:** the two tokens to join, represented as `[string, string]`.

Pair counting visits neighbouring indices from the start of each word to its penultimate token. Merging builds a new word from left to right: a match consumes two input tokens and produces one output token; a non-match consumes and copies one. The result should not silently cross word boundaries or partially apply the selected rule.

:::exercise{path="../exercises/bpe" command="pnpm exec vitest run exercises/bpe/tests --config vitest.exercise.config.ts" title="Count and merge token pairs"}
Implement deterministic pair counting and a non-overlapping merge. The starter counts only one occurrence per word.
:::

## Common failure modes

- **Deduplicating within each word:** repeated occurrences are undercounted.
- **Replacing only the first match:** the learned rule is not applied consistently across the corpus.
- **Reusing a token in overlapping merges:** one input token incorrectly contributes to two output tokens.
- **Merging across word boundaries:** pairs are created that were never adjacent inside a word.
- **Leaving ties unspecified:** identical training data can produce different merge orders and vocabularies.

## In real models

Real releases publish a tokenizer and vocabulary alongside the weights because token IDs are part of the model contract. Configuration comparisons must not treat vocabulary size, byte handling, or special-token conventions as incidental metadata.

## Recap and self-check

You should now be able to explain that BPE learns an **ordered** list of globally applied pair merges, while token IDs are assigned from the resulting vocabulary for use by later numeric layers.

Check your understanding:

- Why is the count of `a + a` equal to 2 in `["a", "a", "a"]`, while one merge pass produces only one `aa` token?
- Why is “replace the first occurrence” inconsistent with a learned BPE rule?
- Why can two tokenizers trained on the same text learn different vocabularies when ties are broken differently?
