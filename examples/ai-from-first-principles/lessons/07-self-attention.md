---
id: self-attention
title: Self-attention
order: 10
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Record your prediction"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "Can token 2 attend to token 3, and what will post-softmax masking change?"
  - { id: experiment, title: "Save an attention-matrix experiment", phase: experiment, completion: explorable-event, instanceId: attention-workbench, event: experiment-recorded }
  - { id: implement, title: "Attempt the exercise and run its tests", phase: apply, completion: learner }
  - id: explain
    title: "Explain the result and one failure mode"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "What invariant did your evidence reveal, and how did the broken mode violate it?"
objectives:
  - compute scaled query-key scores
  - interpret softmax rows as mixing weights
  - explain why a causal mask is applied before softmax
---

# Self-attention

The previous lesson produced one residual-stream vector for every token position. **Self-attention** lets each position build an update by selecting and mixing information from other positions in the same sequence.

## Queries, keys, and values

For every residual vector `x_i`, three learned linear projections produce:

- a **query** `q_i`: the vector used by position `i` to score possible source positions;
- a **key** `k_i`: the vector against which another position's query is compared;
- a **value** `v_i`: the information contributed if position `i` receives attention weight.

The “query asks, key matches, value supplies” wording is a useful memory aid, but these are learned numeric vectors rather than hand-written labels or database fields.

For one attention head, let:

- `n` be the number of token positions;
- `d` be the width of each query, key, and value vector;
- `i` be the row/query position;
- `j` be the column/source position.

The query at position `i` compares with the key at position `j` using a **dot product**. A larger dot product means greater numeric compatibility for that learned head. Dividing by `sqrt(d)` keeps scores from growing merely because the vectors have more coordinates.

When RoPE is used, the position-dependent rotations from the previous lesson are applied to these query and key vectors before their dot product is taken. The value vectors remain the information to be mixed.

**Softmax** converts a row of arbitrary scores into non-negative mixing weights whose sum is 1. A decoder also needs a **causal mask**: while predicting from position `i`, it must not read source positions later than `i`. The experiment tests when that constraint must be applied.

> **Predict:** With a causal mask on, can token 2 assign any weight to token 3? Predict what happens if masking is applied after softmax instead.

:::explorable{src="../explorables/attention/index.ts" title="Self-attention score and weight matrices" height="610" id="attention-workbench"}
Create three one-dimensional query and key values. Rows are querying tokens and columns are possible source tokens. First save a run with the causal mask on and broken mode off. Then enable **Mask after softmax (broken)**, save another run, and compare future-token weight and row sums. Because `d = 1` here, score scaling divides by `sqrt(1) = 1`.
:::

## The attention calculation

A correct causal attention head performs these steps for every row `i`:

1. **Score:** `score[i][j] = dot(q_i, k_j) / sqrt(d)`.
2. **Mask:** replace every future score where `j > i` with negative infinity.
3. **Normalize:** apply stable softmax across that entire masked row to produce `weight[i][j]`.
4. **Mix values:** `output_i = sum over j of weight[i][j] × v_j`.

Negative infinity contributes zero after softmax. Each causal row still has at least its current token available, so its valid weights sum to 1. “Stable” softmax subtracts the largest finite score before exponentiating; this produces the same probabilities while avoiding overflow for values such as `1000`.

The workbench isolates steps 1–3 with scalar queries and keys. It does not display values or the final mixed output, so attention weights are the evidence here rather than the complete attention result.

## A worked row

Suppose token 2 has scalar query `[1]`. The three keys are `[1]`, `[2]`, and `[9]`, and their values are `[10]`, `[20]`, and `[100]`. Token 3 is in the future.

The raw score row is `[1, 2, 9]`. Correct causal masking changes it to `[1, 2, -∞]` before softmax. Subtracting the visible maximum 2 gives `[-1, 0, -∞]`, so the weights are approximately:

```text
[0.269, 0.731, 0.000]
```

They sum to 1, and the weighted value is:

```text
0.269 × 10 + 0.731 × 20 + 0 × 100 = 17.31
```

If softmax sees the future score 9 first, it gives almost all probability to token 3. Zeroing that probability afterwards leaves only about `0.001` total weight on the visible prefix. The future entry is zero, but the remaining row is no longer a normalized mixture. That is the broken mode's failure.

## Inspect the invariants

A valid causal attention matrix has two useful invariants:

- every row sums to 1;
- every cell above the causal diagonal, where `j > i`, is 0.

Without a causal mask, later columns become visible. During next-token training that would leak the answers from future tokens into earlier representations.

## Shapes and loops

With sequence length `n` and head width `d`:

- **Queries, keys, values:** `[n][d]`, one vector per token.
- **Scores:** `[n][n]`, every query-key comparison.
- **Weights:** `[n][n]`, one normalized source distribution per query.
- **Output:** `[n][d]`, one weighted value vector per token.

In TypeScript, `number[][]` represents each matrix. The row index must remain the query position and the column index the source position. Mixing values reduces across source positions `j`, not across feature coordinates.

:::exercise{path="../exercises/attention" command="pnpm exec vitest run exercises/attention/tests --config vitest.exercise.config.ts" title="Implement masked attention weights"}
Implement stable softmax and causal masking. The starter masks probabilities without renormalising. Add one test using query and key values you created in the workbench.
:::

## Common failure modes

- **Masking after softmax:** visible weights no longer sum to 1.
- **Omitting the mask:** training positions can read future answers.
- **Using naive exponentials:** large scores overflow to `Infinity` and produce invalid probabilities.
- **Forgetting `sqrt(d)` scaling:** wider heads tend to produce excessively sharp score distributions.
- **Swapping rows and columns:** the implementation answers “who reads this token?” instead of “which sources does this token read?”
- **Mixing keys instead of values:** keys choose compatibility; values carry the resulting information.

## In real models

This full softmax-attention path is the comparison baseline for MLA, linear attention, DeltaNet, KDA, and other efficient variants. Those mechanisms are meaningful only when we can state what information, memory growth, or retrieval behavior changed relative to this baseline.

## Recap and self-check

Self-attention compares queries with keys, masks unavailable sources, normalizes each row, and uses those weights to mix values. The mask must change the inputs to softmax, not damage its output afterwards.

Check your understanding:

- For row `i`, what do column `j`, `score[i][j]`, and `weight[i][j]` each mean?
- Why do valid causal rows sum to 1 even though some columns are unavailable?
- What role does a value vector play that a key vector does not?
- What information leak appears during next-token training if future positions are not masked?
