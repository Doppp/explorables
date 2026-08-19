---
id: next-token-training
title: Next-token training
order: 10
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Take a next-token training step", completion: explorable-event, instanceId: next-token-lab, event: simulation-completed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - align each input position with the token one step to its right
  - average stable cross-entropy across valid sequence positions
  - update a small model from accumulated per-position gradients
prerequisites:
  - transformer-block
  - losses-optimisers
---

# Next-token training

The Transformer blocks in the previous lesson can turn a sequence of token
representations into one output vector per position. To learn useful parameters, the
model needs a training question with a known answer. A base autoregressive language
model uses a simple one: **given the tokens so far, which token comes next?**

Suppose one training window contains

```text
red  blue  red  green
```

The small model in this lesson begins with a strong bias to copy its current token.
There are two superficially plausible ways to label the rows: pair each input with
itself, or pair it with the token one place to the right.

> **Predict:** A model is biased to copy its current token. Will it score better against correctly shifted next-token targets or incorrectly unshifted targets?

Record which score you expect to be lower *before* taking a training step, and say
what behaviour that lower score would actually reward.

:::explorable{src="../explorables/next-token-training/index.ts" title="Shifted next-token training laboratory" height="720" id="next-token-lab"}
Train a small token-transition model on a visible sequence. The table aligns each input with its next-token target, probability, and cross-entropy before accumulating gradients into one update. A broken unshifted mode labels every token with itself, making an identity-biased model look misleadingly accurate.
:::

## Compare the two objectives

Read the input and target columns before looking at the loss.

1. With broken mode off, verify the three pairs for the default four-token window.
2. Take one correct training step. Compare **mean loss**, **previous loss**, and the
   target probabilities.
3. Take several more steps and watch which transitions become more probable.
4. Reset, enable **Use the current token as its own target (broken)**, and inspect the
   pairs before taking a step. Compare its initial loss with the correct run.
5. Edit the sequence so the same input token is followed by different targets. Ask
   what a one-token transition table can and cannot learn from that ambiguity.

The low initial loss in broken mode is flattering for the wrong reason: every label
repeats the input, so the copy-biased parameters are rewarded. A decreasing number
only establishes that the model is improving on the objective it was given. It does
not establish that the objective represents the intended task.

## Shift inputs and targets

Let a tokenised window be `x₀, x₁, ..., x_{T−1}`. At position `t`, the input
contains token `xₜ`, and the training target is the token one step to its right,
`xₜ₊₁`. The valid aligned pairs are therefore

```text
input:   x₀    x₁    ...   x_{T−2}
target:  x₁    x₂    ...   x_{T−1}
```

There are `T - 1` pairs in a window of `T` tokens. The final token has no following
target *inside that window*, so its output is not included in this window's loss.
For the visible example, the pairs are

- **Position 0:** input `red`, next-token target `blue`.
- **Position 1:** input `blue`, next-token target `red`.
- **Position 2:** input `red`, next-token target `green`.

This alignment operation is often called **target shifting**. It changes which
known answer each output is scored against; it does not change which positions the
model is allowed to read.

## Target shifting is not causal masking

These are separate correctness conditions:

- **Target shifting** pairs the output at position `t` with token `xₜ₊₁` for the
  loss.
- **Causal masking** prevents the representation at position `t` from reading token
  positions greater than `t` while producing that output.

A row can have the correct next-token label and still cheat if attention can see that
future token. Conversely, a perfectly causal model can be trained on the wrong
unshifted labels and learn copying. Both errors may produce a loss that decreases.

During **training**, all tokens in a window are known, so a Transformer can compute
many causally masked positions in parallel and compare them with shifted targets.
During **inference**, the future target is unknown: the fixed model produces logits
for the next token, a decoding policy selects one, and that selected token is added
to the context. Target shifting is a way to construct training examples, not a step
that supplies answers during generation.

## From logits to mean cross-entropy

For every valid input position, the model produces one **logit** per vocabulary
token. Logits are unrestricted scores, not probabilities. Stable softmax converts
them into probabilities `p`, and the cross-entropy for the correct target `y` is

```text
loss at position t = -ln(pₜ[y])
mean loss = (sum of valid position losses) / (T - 1)
```

If the model assigns the target probability `0.5`, that row's loss is about `0.693`.
At probability `0.1`, it is about `2.303`. Higher probability for the correct target
therefore means lower loss. Computing softmax after subtracting the largest logit
keeps the exponentials numerically stable without changing the probabilities.

The mean matters because it keeps the loss scale comparable across windows with
different numbers of valid positions. Padding or deliberately ignored positions
would also be excluded from both the sum and the divisor in a larger training
system.

## Accumulate one training update

Each aligned position contributes a gradient: a signal saying how its logits should
change to reduce that position's loss. If an input token appears more than once, its
contributions accumulate. The explorable averages the accumulated gradients over
the valid rows and then applies one parameter update.

This visible transition table is deliberately smaller than a Transformer: its
current token directly selects a row of a square weight matrix, so it cannot use a
longer prefix to resolve ambiguous transitions. The training responsibilities are
the same ones the capstone applies to Transformer logits:

```text
token window
  → shifted input/target pairs
  → logits for each valid input position
  → stable softmax and per-position cross-entropy
  → mean loss
  → accumulated gradients
  → one parameter update
```

The loss shown before a step belongs to the current parameters; **next loss** is the
loss after the update on the same window. Reusing the same data demonstrates
optimisation, not generalisation to unseen sequences.

:::exercise{path="../exercises/next-token-training" command="pnpm exec vitest run exercises/next-token-training/tests --config vitest.exercise.config.ts" title="Implement shifted next-token training"}
Construct shifted input-target pairs, compute stable mean cross-entropy, and apply the accumulated transition-matrix gradient. The starter uses each token as its own target.
:::

Trace one short window on paper before editing: write the expected number of pairs,
the first and last target, and which weight row receives each contribution. Then run
the documented tests after your attempt and interpret any failing example as an
alignment, numerical-stability, averaging, or update problem.

## Common failure modes

- **Unshifted labels:** the model is rewarded for reproducing the token already in
  its input.
- **An off-by-one final row:** scoring the last token without an in-window next token
  invents a target or reads past the array.
- **A future-visible attention mask:** correct shifted labels are present, but the
  model can copy the answer from a forbidden position.
- **Unstable cross-entropy:** directly exponentiating large logits can overflow;
  taking `ln(0)` after rounded probabilities can produce infinity.
- **Summing but reporting a mean:** window length changes the apparent loss scale and
  the effective update size.
- **Updating before all rows are accumulated:** later gradients are computed from
  different parameters, so the code no longer implements the stated batch update.

## In real models

Scaling the model or changing its attention and expert blocks does not change the causal target shift demonstrated here. Release reports may add post-training objectives, but architecture comparisons must first preserve the base language-model objective and masking contract.

## Recap and self-check

Next-token training uses each position's causal representation to predict the token
one step to its right. Shifted targets define the answers, causal masking limits the
information used to produce them, stable cross-entropy scores the answers, and an
optimiser updates parameters from the mean gradient.

Check your understanding without running the explorable again:

1. For five tokens, how many in-window next-token pairs are scored, and why?
2. Write the input and target rows for `A B C A`.
3. Explain why causal masking and shifted targets must both be correct.
4. If masking leaks a future token, can loss decrease while the model learns an
   invalid shortcut? State what the score would and would not prove.
5. Why does a training loss measured repeatedly on one window say nothing by itself
   about generalisation?
