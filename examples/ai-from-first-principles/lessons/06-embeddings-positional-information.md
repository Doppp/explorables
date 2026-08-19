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

The BPE tokenizer from the previous lesson turns text into token IDs. Neural-network layers work with vectors, so the next step is to turn each ID into a learned vector without confusing token identity with token position.

## Keep four representations separate

These values belong to different stages of the model:

- **Token:** a piece of text, such as `"cat"`.
- **Token ID:** an integer used only to select a vocabulary row, such as `0`.
- **Embedding:** the learned vector stored in that row, such as `[1, 0.2, 0.1, -0.1]`.
- **Residual-stream vector:** the per-token working vector carried and updated through Transformer
  layers, written here as `x_i`.

The subscript `i` means “at sequence position `i`.” A **sequence position** is a location such as 0 or 8; it is not a token ID.

An **embedding table** is a matrix with one row per vocabulary token. If the vocabulary size is `V` and the model width is `d_model`, its shape is `[V][d_model]`. Looking up ID `t` means selecting row `E[t]` from table `E`; it is not multiplication by the number `t`.

For example, suppose:

```text
ID 0 (cat) → [1.0, 0.2]
ID 1 (dog) → [0.9, 0.3]
```

The ID sequence `[0, 1, 0]` becomes `[[1.0, 0.2], [0.9, 0.3], [1.0, 0.2]]`. Both occurrences of ID 0 select the same learned row even though they occupy different positions.

The selected embedding becomes the initial content placed into the residual stream for that token. Later layers add updates to the residual-stream vectors; they do not replace the token IDs in the tokenizer.

## Direction, length, and position

The **L2 norm** of a vector is its geometric length. For `[a, b]`, it is `sqrt(a² + b²)`. **Cosine similarity** compares directions:

```text
cosine(a, b) = dot(a, b) / (norm(a) × norm(b))
```

Here `a` and `b` are vectors, `dot` is the dot product from the linear-layer lesson, and `norm` is vector length. A cosine near 1 means similar directions, not that two tokens are identical or guaranteed to have the same meaning.

Embedding lookup alone contains no position. A model therefore needs a separate mechanism that lets later calculations distinguish the first `cat` from a later `cat`.

> **Predict:** If `cat` appears at positions 0 and 8, does embedding lookup produce different rows? What property of a vector should a pure rotation preserve?

:::explorable{src="../explorables/embeddings-position/index.ts" title="Token embedding and positional rotation workbench" height="610" id="embedding-position"}
Choose two tokens and compare their embedding directions. Move one token through sequence positions and watch its fixed embedding row beside a RoPE-style rotated copy. Then enable **Add position to every coordinate (broken)** and compare both L2 norms. This visual applies the transformation to an embedding copy to isolate the geometry; the production placement of RoPE is explained below.
:::

## What the manipulation shows

Changing the position does not change the row selected for `cat`. In the normal mode, the displayed direction changes while the norm stays fixed. A rotation changes orientation without stretching the vector.

The broken mode instead adds the position number to every coordinate. At large positions that shared offset dominates the original entries, changes the norm, and makes unrelated token vectors point increasingly alike. Raw position is then overwhelming content rather than changing how positions relate.

## A worked coordinate-pair rotation

For one coordinate pair `[a, b]` and rotation angle `θ` (the Greek letter theta), a two-dimensional rotation produces:

```text
[a × cos(θ) - b × sin(θ),
 a × sin(θ) + b × cos(θ)]
```

With `[a, b] = [1, 0]` and `θ = 90°`, the result is `[0, 1]`. Both vectors have norm 1. A wider even-length vector is divided into pairs such as coordinates 0–1 and 2–3. RoPE rotates each pair at a different position-dependent frequency, which lets different pairs represent different distance scales.

The exercise uses the same idea: position 0 has angle 0 and leaves every pair unchanged; later positions change direction while preserving norm.

## Where RoPE actually belongs

**Rotary positional embedding (RoPE)** does not normally rotate the residual-stream embedding directly. The actual attention path is:

1. Token ID `t_i` selects an embedding, producing the initial residual vector `x_i`.
2. Learned linear projections turn the current residual vector into a **query** `q_i`, **key** `k_i`, and **value** `v_i`.
3. RoPE rotates coordinate pairs in `q_i` and `k_i` according to position `i`.
4. Attention compares the rotated queries and keys, then mixes the unrotated values.

The next lesson defines queries, keys, and values fully. For now, the important boundary is: **token IDs select embeddings; residual vectors carry token state; RoPE supplies position to queries and keys used for attention.**

If `R_i` means “rotate for position `i`,” then a dot product between `R_i(q)` and `R_j(k)` depends on the relative rotation between positions `i` and `j`. This is how position can affect query-key compatibility even though rotation preserves the norm of each vector.

## Shapes in TypeScript

For a sequence of `n` tokens and model width `d_model`, let `d_head` mean the vector width assigned to one attention head:

- **Token IDs:** `[n]`.
- **Embedding table:** `[V][d_model]`.
- **Looked-up embeddings / initial residual stream:** `[n][d_model]`.
- **One token's query, key, or value:** `[d_head]` in one attention head.

An embedding lookup should return independent row copies. If it returns references into the table, changing a looked-up result can accidentally change the learned parameter table itself. A pair rotation also requires a positive even width so every coordinate has a partner.

:::exercise{path="../exercises/embeddings-position" command="pnpm exec vitest run exercises/embeddings-position/tests --config vitest.exercise.config.ts" title="Implement embedding lookup and pair rotation"}
Return independent copies of embedding rows and rotate every coordinate pair using its position-dependent frequency. The starter returns table references and adds the position to every coordinate.
:::

## Common failure modes

- **Treating IDs as quantities:** arithmetic on token IDs invents an ordering the vocabulary does not contain.
- **Returning table aliases:** modifying a lookup result mutates the embedding table.
- **Mixing up token ID and sequence position:** one chooses a row; the other describes where that occurrence sits.
- **Adding a raw position scalar:** vector length grows and position can swamp token content.
- **Rotating the wrong representation:** RoPE belongs on attention queries and keys, not on token IDs, values, or the residual stream itself.
- **Ignoring vector shape:** an odd-width vector leaves an unpaired coordinate.

## In real models

Modern decoder models often replace learned absolute position vectors with rotary or other relative-position mechanisms. The implementation changes, but the architectural question remains the same: how does token identity acquire usable information about order and distance?

## Recap and self-check

You should now be able to trace `text → token IDs → embedding lookup → residual-stream vectors`, while keeping RoPE as a later transformation of attention queries and keys.

Check your understanding:

- Why must embedding lookup return the same token vector wherever it appears?
- What is the difference between token ID 8 and sequence position 8?
- Why should changing a returned embedding row not mutate the table?
- How can rotating queries and keys make their dot product depend on relative position without changing either vector's norm?
