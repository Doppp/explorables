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

Training scores many positions together. Generation repeatedly predicts one token, appends it to the context, and predicts again. Recomputing every earlier key and value at every step gives the right answer while repeating work.

> **Predict:** As the sequence grows, which path performs more projection work: full recomputation or a KV cache? Should correct caching change the model's output?

:::explorable{src="../explorables/kv-cache/index.ts" title="Prefill and KV-cache decoding laboratory" height="680" id="kv-cache-lab"}
Choose the prompt and total sequence lengths. The trace separates prefill from decode steps and compares full recomputation with cached projection work and memory. A broken mode discards prior keys and values, reducing memory by changing the answer.
:::

## Prefill, then decode

During **prefill**, the model processes the prompt and creates a key and value for every prompt position. During **decode**, it projects only the newest token and appends its key and value. The current query still attends over the entire causal cache.

The cache trades memory for less repeated computation. For one layer, its stored values grow with sequence length, head width, and the number of key and value heads. It does not contain finished answers and it does not remove the need to compute a new query.

## Break the equivalence

Enable **Keep only the newest key and value**. The work and memory numbers look excellent, but output equivalence fails because the prompt has vanished from attention.

:::exercise{path="../exercises/kv-cache" command="pnpm exec vitest run exercises/kv-cache/tests --config vitest.exercise.config.ts" title="Implement incremental KV caching"}
Append projected keys and values without mutating or dropping history, then compute stable scaled attention across the complete cache.
:::

## Tiny Transformer capstone

The final capstone combines the course's token embeddings, causal attention, residual stream, RMS normalisation, next-token loss, parameter updates, greedy generation, and cached decoding in one deterministic model.

Before opening the atlas, predict which stage first mixes information from multiple token positions. Then select each stage in order and compare your prediction with the exact tensor values.

:::explorable{src="../explorables/model-atlas/index.ts" config="../explorables/model-atlas/tiny-transformer.json" title="Tiny Transformer 3D model atlas" height="760" id="tiny-transformer-atlas"}
Walk a fixed three-token prompt through the executable teaching model, then compare its disclosed dimensions with OpenAI's published GPT-2 small baseline. The 3D blocks and semantic stage list stay synchronized; the inspector reports exact values only for the teaching model and remains the complete fallback when WebGL is unavailable.
:::

:::explorable{src="../explorables/tiny-transformer/index.ts" title="Tiny Transformer training and generation capstone" height="760" id="tiny-transformer-capstone"}
Train a one-layer language model on a fixed cyclic corpus. Inspect its loss, generated tokens, cached-versus-uncached result, and final hidden state. Broken residual and evaluation modes reveal why a plausible result may not support the intended claim.
:::

:::exercise{path="../exercises/tiny-transformer-capstone" command="pnpm exec vitest run exercises/tiny-transformer-capstone/tests --config vitest.exercise.config.ts" title="Assemble the tiny Transformer invariants"}
Implement the capstone's shifted examples, causal attention with a residual path, and language-model-head gradient.
:::

## In real models

KV-cache growth is one reason recent architectures investigate compressed or fixed-size recurrent state. Kimi Linear and Kimi K3 trade some full-attention layers for KDA state updates, then retain periodic softmax retrieval where a fixed-capacity memory would lose important context.

## Explain and transfer

Why is cached decoding an equivalence-preserving optimisation, while truncating the cache is a model change? Which measurements would you record before choosing a cache strategy for a longer-context model?
