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

The previous two lessons built attention: for each token position, it gathers
information from allowed positions in the sequence. A language model still needs a
way to refine that result through many layers without erasing useful information at
every step. A **Transformer block** packages two kinds of refinement:

- attention moves information between token positions; and
- a feed-forward network, or **MLP**, transforms each position independently.

Both refinements write into the **residual stream**. The residual stream is the
running vector representation carried from one block to the next. For a model width
of `d`, one token's representation is a vector `x ∈ Rᵈ`; a whole sequence is a
matrix with one such row per position.

Before seeing the formal block equations, consider the safest possible behaviour
for a sublayer that has nothing useful to contribute.

> **Predict:** If both attention and MLP produce all-zero updates, what should a correct residual block return? What happens if each sublayer replaces its input instead of adding to it?

Record your answer before changing a control. In particular, say whether the
original signs and magnitudes should remain available at the output.

:::explorable{src="../explorables/transformer-block/index.ts" title="Pre-norm Transformer block trace" height="780" id="transformer-block-trace"}
Trace one four-dimensional token representation through RMSNorm, an attention update, the first residual addition, a SwiGLU MLP, and the second residual addition. Change the attention update scale or deliberately replace residuals to see when the identity path disappears.
:::

## Run the comparison

Start with the default residual-stream vector and read the trace from top to bottom.
The rows are intermediate values from one forward pass, not separate tokens.

1. Move **Attention update scale** to zero and note the input, attention update,
   value after the first residual operation, and final output.
2. Enable **Replace instead of add residuals (broken)** without changing the zero
   attention scale. Find the first row at which the original input disappears.
3. Restore residual addition, use a non-zero attention scale, and compare the input
   and output norms. A residual connection preserves a path for the input; it does
   not require the output to have the same norm.
4. Try a constant vector such as `2, 2, 2, 2`. Look at the RMS-normalised row and
   keep that observation for the normalisation comparison below.

## The two residual updates

A **pre-norm** block normalises the value *before* each sublayer. In compact
notation, its forward pass is

```text
a = x + Attention(RMSNorm(x))
y = a + MLP(RMSNorm(a))
```

Here `x` is the block input, `a` is the residual stream after attention, and `y` is
the block output. It is also useful to name the two updates:

```text
Δattention = Attention(RMSNorm(x))
Δmlp       = MLP(RMSNorm(x + Δattention))
y           = x + Δattention + Δmlp
```

The `+` operations are element-by-element additions, so both operands must have
width `d`. When an update is zero, addition leaves the incoming residual stream
unchanged. This unchanged route is often called the **identity path**. Replacement
mode instead computes something like `a = Attention(RMSNorm(x))`; a zero update then
turns `a` into a zero vector and destroys the path.

The identity path also matters during backpropagation. For a residual update
`y = x + f(x)`, the derivative contains a direct identity contribution in addition
to the derivative through `f`. Gradients therefore have a route through the stack
that does not depend entirely on every sublayer's learned transformation. Residual
connections do not guarantee perfectly scaled gradients, but they make very deep
stacks substantially easier to optimise.

The explorable traces one selected token after its attention result has already been
computed. In a real block, attention receives all token rows and performs the
sequence mixing from the previous lessons. The MLP then applies the same learned
transformation independently to every row.

## RMSNorm rescales without mean-centring

Neural-network activations can arrive at very different magnitudes. **RMSNorm**
divides a vector by its root mean square (RMS) without first subtracting the
vector's mean. It then applies learned per-coordinate gains. With gain values `gᵢ`
and a small positive `ε`, each component is

```text
rms(x) = sqrt((x_1² + x_2² + ... + x_d²) / d + ε)
RMSNorm(x)_i = g_i x_i / rms(x)
```

For `x = [2, 2]`, unit gains `g = [1, 1]`, and a negligible `ε`, the RMS is `2`,
so the result is approximately `[1, 1]`. With those gains, the components stay
positive. RMSNorm does **not** subtract the vector's mean.

That is the important difference from mean-centred normalisation such as
LayerNorm. Mean-centring `[2, 2]` first produces `[0, 0]`; dividing by RMS alone
preserves the vector's direction and changes its scale. The learned `gᵢ` values can
then change coordinates by different amounts and, if a gain is negative, flip that
coordinate's sign. The complete learned RMSNorm operation therefore does not in
general preserve direction or sign pattern. `ε` prevents division by zero for very
small vectors.

## SwiGLU makes a gated MLP update

The block's MLP first expands a width-`d` representation into a wider hidden
representation, applies a non-linearity, and projects it back to width `d`. A
**SwiGLU** MLP uses two learned projections of the same normalised input `n`:

```text
gate   = W_gate n
value  = W_value n
hidden = SiLU(gate) ⊙ value
Δmlp    = W_down hidden
```

The symbol `⊙` means element-by-element multiplication. `SiLU(s) = s · sigmoid(s)`
changes smoothly rather than acting as a hard on/off switch. Each
gate component controls how much of the corresponding value component contributes.
The down projection returns the update to width `d`, which makes the second residual
addition shape-compatible.

A one-component example shows the gating idea. If the gate projection produces
`0`, then `SiLU(0) = 0`, so that hidden component contributes nothing even when its
value projection is non-zero. If the gate is strongly positive, more of the value
passes through. The real explorable uses several hidden components and shows their
combined projected update.

## Connect the trace to code

The data flow in the trace maps directly to a block implementation:

- **Input residual stream:** preserve the original width-`d` vector.
- **RMSNorm 1:** compute mean square, inverse RMS, and learned scaling.
- **Attention update:** transform the normalised view; across a full sequence this is the mixing
  step.
- **After residual add 1:** add the update to the untouched input.
- **RMSNorm 2:** normalise the updated residual stream.
- **SwiGLU hidden:** combine gate and value projections element by element.
- **MLP update:** project the hidden vector back to width `d`.
- **Output after residual add 2:** add the MLP update without discarding the first residual result.

During **training**, this forward pass produces representations that eventually
produce logits and a loss; backpropagation computes parameter gradients, and an
optimiser changes the norm, attention, and MLP weights. During **inference**, the
same block arithmetic runs with fixed learned parameters to produce logits for a
prompt or decode step. Residual addition is required in both modes; it is not a
training-only trick.

:::exercise{path="../exercises/transformer-block" command="pnpm exec vitest run exercises/transformer-block/tests --config vitest.exercise.config.ts" title="Implement RMSNorm and a residual sublayer"}
Normalise by root mean square, pass the normalised vector to a supplied transformation, and add its update to the untouched input. The starter mean-centres like LayerNorm and returns only the transformation result.
:::

Before editing, identify which intermediate must remain untouched for the residual
addition. After an attempt, run the supplied tests. If one fails, use its inputs to
decide whether the error is in normalisation or in the identity path; do not change
both blindly.

## Common failure modes

- **Replacing rather than adding.** A zero or initially weak sublayer can erase the
  representation instead of making a small refinement.
- **Mean-centring in RMSNorm.** This silently implements a different operation and
  is exposed by a constant non-zero vector.
- **Normalising the residual branch itself.** The sublayer should receive a
  normalised view while the addition retains the untouched incoming value.
- **Returning the hidden-width MLP vector.** The down projection must restore model
  width before residual addition.
- **Mutating the saved input.** In-place edits can make `x + update` accidentally
  add an update to an already changed value.

## In real models

Frontier models modify both branches of this block with sparse experts, alternative attention, gates, and different normalization placement. Kimi K3's Attention Residuals also change how later depth retrieves earlier residual states, making this ordinary residual stream the necessary baseline.

## Recap and self-check

A pre-norm Transformer block lets attention and an MLP contribute learned updates
while an identity path carries the residual stream through both additions. RMSNorm
rescales without mean-centring, then applies learned per-coordinate gains. SwiGLU
multiplies a nonlinear gate branch by a value branch before projecting the result
back to model width.

Without looking back, answer these questions:

1. Write the two residual equations and label the identity paths.
2. With unit positive gains, why does RMSNorm preserve the sign pattern of a
   constant non-zero vector while mean-centred normalisation removes it? Why need
   that claim be qualified for arbitrary learned gains?
3. At which stage does information move between token positions, and at which stage
   is each position transformed independently?
4. Why is an unchanged residual path useful for gradient flow through many blocks?
5. Name one input that would expose replacement mode and one that would expose
   accidental mean-centring.
