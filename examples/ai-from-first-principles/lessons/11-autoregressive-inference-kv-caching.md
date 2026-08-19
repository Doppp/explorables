---
id: autoregressive-inference-kv-caching
title: Autoregressive inference and KV caching
order: 11
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate the KV-cache trace", completion: explorable-event, instanceId: kv-cache-lab, event: parameter-changed }
  - { id: implement, title: "Attempt both exercises and run their tests", completion: learner }
  - { id: explain, title: "Explain equivalence and one failure mode", completion: learner }
objectives:
  - distinguish prompt prefill from token-by-token decoding
  - explain which attention values a KV cache reuses
  - verify that cached and uncached decoding produce equivalent outputs
  - relate cache memory growth to sequence length
---

# Autoregressive inference and KV caching

The previous lesson trained a model by scoring many shifted positions whose answers
were already present in a training window. **Inference** starts after training, with
the learned parameters fixed. Given a prompt, the model must produce a next-token
distribution without being given the answer.

Autoregressive generation repeats a loop:

```text
current context → model logits → choose one token → append it → repeat
```

The context grows by one token each time. An uncached implementation can recompute
the whole prefix on every iteration. A cached implementation saves selected
intermediate values from earlier tokens and reuses them.

> **Predict:** As the sequence grows, which path performs more projection work: full recomputation or a KV cache? Should correct caching change the model's output?

Record both parts of your prediction. Treat “output” as the model's logits or
attention result under the same context and parameters, not as two unrelated random
samples.

:::explorable{src="../explorables/kv-cache/index.ts" title="Prefill and KV-cache decoding laboratory" height="680" id="kv-cache-lab"}
Choose the prompt and total sequence lengths. The trace separates prefill from decode steps and compares full recomputation with cached projection work and memory. A broken mode discards prior keys and values, reducing memory by changing the answer.
:::

## Observe work, memory, and output

Use the output difference as the correctness check rather than treating lower work
as sufficient.

1. Keep **Total tokens** at `6` and **Prompt tokens** at `3`. Compare cached and
   uncached projection work and confirm the maximum output difference.
2. Increase total length while holding the prompt length fixed. Watch both saved
   work and final cache memory.
3. Increase the prompt length. Notice which row is labelled **prefill** and which
   later rows are labelled **decode**.
4. Enable **Keep only the newest key and value (broken)**. Compare its memory and
   output difference with the intact cache.

The explorable uses two-dimensional token vectors and treats them as already
projected queries, keys, and values. Its “projection work” is a teaching count of
three projections per processed token. Real models use learned projection matrices
in every attention layer, but the reuse boundary is the same.

## Prefill and decode are different phases

**Prefill** processes the entire prompt. With a causal mask, prompt positions can be
computed in parallel: position `t` reads only positions up to `t`. Every attention
layer creates and stores one key and one value for each prompt position. The final
prompt position produces logits for the first generated token.

The decoding policy chooses that token. Then **decode** processes just the newly
appended token through the model. At each attention layer it computes

- a new query for the current position;
- one new key and value to append to that layer's cache; and
- attention between the current query and all keys and values that remain in the
  causal context.

Decode repeats one token at a time because the next input token depends on the
previous step's choice. The next lesson controls that choice. This lesson holds the
token sequence fixed so it can compare the computations directly.

Training and inference therefore use the same learned Transformer, but organize
work differently. Training usually evaluates many known, causally masked positions
in parallel and computes a loss and gradients. Inference does not compute training
targets or parameter gradients; it performs prompt prefill once and then a sequence
of dependent decode steps.

## What a KV cache stores

In attention, a token representation is projected into a query `q`, key `k`, and
value `v`. Earlier keys and values do not change when a later token is appended, so
recomputing them wastes projection work. A **KV cache** stores those earlier `k` and
`v` vectors separately for every attention layer.

It does not normally store old queries: only the current query is needed to compute
the current output. It also does not contain finished answers, target tokens, or a
copy of the training data. It is reusable intermediate state for this particular
sequence, model state, layer layout, and positional scheme.

For the explorable's default six two-dimensional vectors, an intact final cache
contains six keys and six values:

```text
6 positions × 2 vector types (K and V) × width 2 = 24 scalar cells
```

The teaching work count makes the recomputation contrast concrete. For a
three-token prompt followed by three decode positions, full recomputation processes
prefix lengths `3`, `4`, `5`, and `6`, at three projections per token:

```text
uncached work = 3 × (3 + 4 + 5 + 6) = 54
cached work   = 3 × 6                 = 18
```

The cache removes repeated key/value projection work. Standard full attention still
compares each new query with an increasingly long cache, so a KV cache does **not**
make all per-token computation or memory constant.

For a conventional cache, an approximate scalar count is

```text
2 × layers × batch × cached positions × KV heads × head width
```

The leading `2` is for keys and values. Multiply by bytes per stored scalar to
estimate memory. Multi-query or grouped-query attention can use fewer KV heads than
query heads, but memory still grows with the number of retained positions.

## Caching should preserve the computation

Correct cached decoding is an **equivalence-preserving optimisation**: under the
same parameters, positions, mask, numerical precision, and token context, it reuses
the same earlier keys and values that full recomputation would recreate. The logits
or attention outputs should match within the chosen floating-point tolerance.

**Truncating** the cache is different. Dropping earlier keys and values means the
current query cannot retrieve information from those positions. The smaller state
may be an intentional sliding-window or recurrent architecture, but it is then a
different context rule, not merely a faster implementation of full-context
attention. The broken toggle demonstrates this distinction: it reports excellent
memory use because it keeps one position, while its non-zero output difference
shows that it changed the answer.

Do not test cache equivalence by comparing two unseeded sampled strings. Even equal
logits can produce different random samples. Compare logits, probabilities, or
deterministic attention outputs directly; alternatively use greedy or controlled
seeded decoding after confirming that the policy itself is identical.

## Connect the trace to code

An incremental attention implementation follows this data flow at each layer:

```text
new token representation
  → project current q, k, v
  → append k and v to matching cache histories
  → score current q against every retained k
  → stable softmax over the scores
  → weighted sum of every matching v
  → current attention output
```

Keys and values must stay paired, keep their original order, and use compatible
shapes. In-place mutation may also be an API bug when callers expect the earlier
cache value to remain usable.

:::exercise{path="../exercises/kv-cache" command="pnpm exec vitest run exercises/kv-cache/tests --config vitest.exercise.config.ts" title="Implement incremental KV caching"}
Append projected keys and values without mutating or dropping history, then compute stable scaled attention across the complete cache.
:::

Before editing, trace the cache lengths after appending two pairs and state which
keys one current query must score. After an attempt, use the supplied tests to
separate append/order failures from attention/softmax failures.

## KV-cache failure modes

- **Resetting the cache on every decode step:** the decoder forgets the prompt and
  earlier generated tokens.
- **Appending keys without matching values:** score index `i` no longer retrieves
  the value for the same position.
- **Using inconsistent positions:** with positional rotations or other positional
  mechanisms, reused keys must retain the position convention used during prefill.
- **Applying a non-causal or wrong-length mask:** the set of cached positions and
  the allowed attention positions disagree.
- **Claiming equivalence after truncation:** smaller memory was purchased by changing
  accessible context.
- **Counting only projection work:** cache reads and full-attention score/value work
  still grow with retained context length.

## Tiny Transformer capstone

The final capstone combines the course's token embeddings, causal attention, residual stream, RMS normalisation, next-token loss, parameter updates, greedy generation, and cached decoding in one deterministic model.

Before opening the atlas, predict which stage first mixes information from multiple token positions. Then select each tiny-model stage in order and compare your prediction with the exact tensor values.

:::explorable{src="../explorables/model-atlas/index.ts" config="../explorables/model-atlas/tiny-transformer.json" title="Transformer model family 3D Atlas" height="1100" id="tiny-transformer-atlas"}
Walk a fixed three-token prompt through the executable teaching model; compare the published GPT-1, GPT-2, and GPT-3 configurations; inspect GPT-4's explicit disclosure boundary; then tour the source-gated DeepSeek V4, Kimi K3, Qwen 3, MiniMax M1, and GLM 5.2 family views. The 3D blocks and semantic stage list stay synchronized. Exact tensor values appear only for the teaching model; unpublished or unfrozen counts remain explicitly undisclosed.
:::

Use the same three-question tour for each frontier family: Which published mechanism changes the information path? Which evidence label supports it? Which tempting numerical comparison is unavailable because the course source freeze is incomplete? The absence of a number is part of the lesson, not a missing visual.

:::explorable{src="../explorables/tiny-transformer/index.ts" title="Tiny Transformer training and generation capstone" height="760" id="tiny-transformer-capstone"}
Train a one-layer language model on a fixed cyclic corpus. Inspect its loss, generated tokens, cached-versus-uncached result, and final hidden state. Broken residual and evaluation modes reveal why a plausible result may not support the intended claim.
:::

:::exercise{path="../exercises/tiny-transformer-capstone" command="pnpm exec vitest run exercises/tiny-transformer-capstone/tests --config vitest.exercise.config.ts" title="Assemble the tiny Transformer invariants"}
Implement the capstone's shifted examples, causal attention with a residual path, and language-model-head gradient.
:::

Treat the capstone as an integration trace, not as evidence that training and
inference are interchangeable. Training uses shifted targets, loss, gradients, and
parameter updates. Generation freezes those parameters, obtains logits from a
causal prefix, chooses tokens, and may reuse its KV cache. Use the broken residual
and evaluation modes to identify which invariant failed before attempting the
exercise; do not infer a repair from loss or generated text alone.

## In real models

KV-cache growth is one reason recent architectures investigate compressed or fixed-size recurrent state. Kimi Linear and Kimi K3 trade some full-attention layers for KDA state updates, then retain periodic softmax retrieval where a fixed-capacity memory would lose important context.

## Recap and self-check

Prefill computes the prompt and initializes per-layer key/value histories. Decode
processes one newly selected token at a time, appends its new keys and values, and
queries the retained history. An intact cache saves repeated projections while
preserving full-recomputation outputs; truncation saves additional memory by
changing which context can influence the model.

Answer these without relying on the explorable's labels:

1. Which tensors are created during prefill, and what new tensors are created at one
   decode step?
2. Why is cached decoding an equivalence-preserving optimisation, while truncating
   the cache is a model change?
3. Why does cache memory grow with sequence length even though only one token is
   decoded at a time?
4. Which part of standard attention still grows more expensive as the cache grows?
5. Which measurements would you record before choosing a cache strategy for a
   longer-context model?
6. Which Atlas view exposes exact tensor values, and what should you conclude when a
   frontier-model count is explicitly unavailable?
