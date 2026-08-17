---
id: embeddings-positional-information
title: Embeddings and positional information
order: 6
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate token position", completion: explorable-event, instanceId: embedding-position, event: parameter-changed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - map token identifiers to learned embedding vectors
  - compare token vectors using cosine similarity
  - explain how RoPE encodes position by rotating coordinate pairs
prerequisites:
  - bpe-tokenisation
  - vectors-matrices-linear-layers
---

# Embeddings and positional information

A tokenizer produces discrete identifiers. An embedding table turns each identifier into a learned vector, but the lookup alone cannot distinguish the same token at two sequence positions.

> **Predict:** If `cat` appears at positions 0 and 8, does embedding lookup produce different rows? What property of a vector should a pure rotation preserve?

:::explorable{src="../explorables/embeddings-position/index.ts" title="Token embedding and positional rotation workbench" height="610" id="embedding-position"}
Choose tokens, compare their learned vectors, and move one token through sequence positions. A RoPE-style coordinate-pair rotation changes direction while preserving vector norm. A deliberately broken scalar positional offset changes the norm and eventually overwhelms token content.
:::

## Separate identity from position

Compare `cat` and `dog`: their nearby table rows give a high cosine similarity. Now move `cat` through positions. The embedding row stays fixed; only the positional transformation changes.

RoPE is applied to query and key coordinate pairs in an actual attention layer, not directly to the residual-stream embedding. This geometric preview isolates the rotation before the next lessons combine it with attention.

:::exercise{path="../exercises/embeddings-position" command="pnpm exec vitest run exercises/embeddings-position/tests --config vitest.exercise.config.ts" title="Implement embedding lookup and pair rotation"}
Return independent copies of embedding rows and rotate every coordinate pair using its position-dependent frequency. The starter returns table references and adds the position to every coordinate.
:::

## In real models

Modern decoder models often replace learned absolute position vectors with rotary or other relative-position mechanisms. The implementation changes, but the architectural question remains the same: how does token identity acquire usable information about order and distance?

## Explain and transfer

Why must embedding lookup return the same token vector wherever it appears? How can rotating queries and keys make their dot product depend on relative position without changing either vector's norm?
