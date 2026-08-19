---
id: sampling
title: Sampling and generation
order: 12
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Sample from the distribution", completion: explorable-event, instanceId: sampling-lab, event: simulation-completed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - relate logits, temperature, and probabilities
  - compare top-k with nucleus sampling
  - detect an invalid truncation order
---

# Sampling and generation

At each generation step, a language model finishes its forward pass with one number
for every vocabulary token. These numbers are **logits**: relative, unnormalised
scores. They may be positive or negative and do not have to sum to one. The model
has not yet produced a finished answer—or even selected the next token.

A **decoding policy** turns the logits into a selection rule. It can reshape the
probabilities, remove candidate tokens, and then choose greedily or draw a random
sample. Changing that policy changes generated behaviour without changing the
model's learned parameters.

The previous lesson's cached and uncached paths produce the same logits. The policy in this lesson is applied after either path; sampling changes how a token is selected, while caching must not change the distribution being sampled.

> **Predict:** As temperature approaches zero, which token dominates? Does a top-p threshold of 0.8 always keep the same number of tokens?

Record both predictions. For top-p, include what property of the current
distribution—not just the threshold—might affect the number kept.

:::explorable{src="../explorables/sampling/index.ts" title="Temperature, top-k, and top-p sampler" height="560" id="sampling-lab"}
Edit four logits, then change temperature, top-k, and top-p. Probability bars show the surviving normalised distribution. A broken top-p ordering keeps tokens in vocabulary order instead of probability order.
:::

## Manipulate the policy

Keep the default logits for the first pass and change one control at a time.

1. Lower temperature toward `0.1`, then raise it toward `2.0`. Watch the gap between
   the highest-scoring token and the others.
2. Restore temperature `1.0`. Compare `top-k = 1`, `2`, and `4`.
3. Keep `top-k = 4` and change top-p. Find two logit settings where the same top-p
   value retains different numbers of tokens.
4. Click **Sample a token** several times. Distinguish the displayed distribution
   from any single random outcome.
5. Give `fox` or `owl` the highest logit, then enable **Use vocabulary order
   (broken)**. Inspect which candidates survive.

The broken mode reveals why nucleus sampling must rank candidates by probability.
If it accumulates `cat`, `dog`, `fox`, `owl` merely because that is vocabulary order,
renaming or reindexing tokens changes the policy even when their logits are the
same.

## Softmax turns logits into probabilities

For logits `zᵢ`, ordinary softmax computes

```text
pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)
```

Adding the same constant to every logit does not change the probabilities. A stable
implementation therefore subtracts the maximum logit before exponentiating; this
avoids overflow while preserving the distribution.

A logit is not itself a probability. For example, logits `[2, 1, 0]` become
approximately `[0.665, 0.245, 0.090]` at temperature `1`. Their ordering is the
same, but their numeric values and interpretation differ.

During **training**, logits are normally compared with a known next-token target by
cross-entropy, as in the previous lessons. A random sample is not needed to compute
that training loss. During **inference**, no target is available; the decoding
policy acts on the current logits, selects a token, and appends it for the next
decode step.

## Temperature changes relative sharpness

Temperature `τ` rescales logits before softmax. The Greek letter avoids reusing
`T`, which denoted sequence length in the previous lesson:

```text
pᵢ(τ) = softmax(zᵢ / τ), with τ > 0
```

When `τ < 1`, logit differences become larger after division, so probability
concentrates on the highest logits. As positive `τ` approaches zero, the highest
logit dominates (ties still require a rule). Exactly `τ = 0` is undefined because
it would divide by zero; deterministic **greedy decoding** instead selects an
argmax directly.

When `τ > 1`, differences shrink and the distribution becomes flatter. Temperature
does not reorder unequal logits, and it does not decide by itself which candidates
are removed.

For the example logits `[2, 1, 0]`, lowering temperature to `0.5` applies softmax to
`[4, 2, 0]`, giving approximately `[0.867, 0.117, 0.016]`. The first candidate was
already most likely; lower temperature makes its advantage more decisive.

## Top-k and top-p remove candidates differently

**Top-k** keeps at most the `k` highest-probability candidates. Top-k alone retains
exactly `min(k, vocabulary size)` candidates. Equivalently, in this lesson's
combined policy, `k = 2` retains two candidates when top-p is disabled with
`topP = 1` and at least two candidates are available. A lower top-p threshold can
stop within that top-k cap and retain fewer than two.

**Top-p**, or **nucleus sampling**, first sorts candidates from most to least
probable, then keeps the smallest prefix whose cumulative probability reaches the
threshold `p`. Its set size adapts to the shape of the distribution. A peaked
distribution may cross `p = 0.8` with one token; a flatter distribution may need
several.

Using `[0.665, 0.245, 0.090]`, top-p `0.8` keeps the first two candidates because
`0.665` is below the threshold but `0.665 + 0.245 = 0.910` reaches it. The kept mass
must then be **renormalised**, producing approximately `[0.731, 0.269]` over those
two candidates so the surviving probabilities again sum to one.

This lesson's policy applies temperature first, then uses top-k as a cap while
accumulating top-p in descending probability order, and finally renormalises. When
policies are combined, their order is part of the protocol and should be reported.

## Connect the controls to code

The complete one-step data flow is

```text
model logits
  → divide by positive temperature
  → stable softmax
  → sort candidates by descending probability
  → apply top-k cap and top-p cumulative threshold
  → renormalise surviving probabilities
  → greedy choice or random draw
  → append selected token to the context
```

Only the final selection is random. The probability table should be deterministic
for fixed logits and policy settings. A single selected token is an observation from
the distribution, not a summary of it.

:::exercise{path="../exercises/sampling" command="pnpm exec vitest run exercises/sampling/tests --config vitest.exercise.config.ts" title="Build a decoding distribution"}
Implement temperature scaling and top-p truncation with stable normalisation. The starter accumulates tokens before sorting them.
:::

Before implementing, hand-calculate which candidates survive one three-token case.
After an attempt, run the supplied tests and decide whether a failure concerns
temperature, stable normalisation, sort order, threshold inclusion, or final
renormalisation. Do not infer correctness from one plausible random token.

## Common failure modes

- **Treating logits as probabilities:** thresholds and random draws then operate on
  values that need not be non-negative or sum to one.
- **Using temperature zero:** division is undefined; greedy decoding needs an
  explicit argmax rule.
- **Exponentiating large raw logits:** numerical overflow can produce invalid
  probabilities even when the mathematical softmax is well defined.
- **Accumulating top-p in vocabulary order:** token IDs, rather than probability,
  decide which candidates survive.
- **Dropping the token that crosses the threshold:** the retained mass may never
  reach `p`; the crossing token belongs to the smallest qualifying prefix.
- **Forgetting to renormalise:** the kept values no longer form a distribution from
  which to sample.
- **Comparing unrelated random draws:** two identical models or cache paths can emit
  different samples by chance.

## In real models

Release evaluations specify temperature, top-p, reasoning settings, trial counts, and harness behavior because decoding policy changes observed results. A model-family case study therefore treats sampling configuration as part of the experimental protocol, not as an afterthought.

## Recap and self-check

The model supplies logits; the decoding policy—not the model weights—converts them
into a candidate distribution and selection. Temperature changes sharpness. Top-k
alone fixes the retained count (and sets a cap when combined with top-p); top-p can
adapt the set within that cap according to cumulative probability. The surviving
probabilities must be renormalised before sampling.

Check your understanding:

1. What is the difference between a logit, a probability, and a selected token?
2. Why can lowering temperature and lowering top-p both reduce variety while
   producing different distributions?
3. Why can the number of top-p candidates change while `p` stays fixed?
4. What ordering and renormalisation invariants must nucleus sampling preserve?
5. To compare two cache implementations, why is comparing logits first—and then a
   greedy or controlled seeded policy—more informative than unrelated random
   samples?
