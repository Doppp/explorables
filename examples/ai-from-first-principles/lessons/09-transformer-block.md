---
id: transformer-block
title: The Transformer block
order: 9
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Manipulate the residual stream", completion: explorable-event, instanceId: transformer-block-trace, event: parameter-changed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - trace a pre-norm residual stream through attention and an MLP
  - distinguish RMSNorm from mean-centred normalisation
  - explain how SwiGLU gates an MLP update
prerequisites:
  - multi-head-attention
  - losses-optimisers
---

# The Transformer block

A pre-norm Transformer block does not replace its representation twice. It
normalises a view of the residual stream, computes an attention update and adds
it, then normalises again, computes a gated MLP update and adds that too.

```text
x → RMSNorm → attention → + x → RMSNorm → SwiGLU MLP → + → output
```

> **Predict:** If both attention and MLP produce all-zero updates, what should a
> correct residual block return? What happens if each sublayer replaces its
> input instead of adding to it?

:::explorable{src="../explorables/transformer-block/index.ts" title="Pre-norm Transformer block trace" height="780" id="transformer-block-trace"}
Trace one four-dimensional token representation through RMSNorm, an attention
update, the first residual addition, a SwiGLU MLP, and the second residual
addition. Change the attention update scale or deliberately replace residuals
to see when the identity path disappears.
:::

## Follow the residual stream

Set the attention update scale to zero. The residual stream still reaches the
MLP. In broken replacement mode, the zero attention result erases the original
token before the MLP sees it.

The attention update in this explorable represents the already-computed result
for one selected token; the previous lesson supplied the sequence mixing.

:::exercise{path="../exercises/transformer-block" command="pnpm exec vitest run exercises/transformer-block/tests --config vitest.exercise.config.ts" title="Implement RMSNorm and a residual sublayer"}
Normalise by root mean square, pass the normalised vector to a supplied
transformation, and add its update to the untouched input. The starter
mean-centres like LayerNorm and returns only the transformation result.
:::

## In real models

Frontier models modify both branches of this block with sparse experts,
alternative attention, gates, and different normalization placement. Kimi K3's
Attention Residuals also change how later depth retrieves earlier residual
states, making this ordinary residual stream the necessary baseline.

## Explain and transfer

Why is an unchanged residual path useful for gradient flow through many blocks?
Why does RMSNorm preserve the sign pattern of a constant non-zero vector while
mean-centred normalisation removes it?
