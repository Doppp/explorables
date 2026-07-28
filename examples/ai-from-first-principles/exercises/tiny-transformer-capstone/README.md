# Assemble the tiny Transformer invariants

Complete `starter/capstone.ts`.

The three functions connect concepts from across the course:

- create shifted next-token examples;
- run stable causal attention while preserving the residual stream;
- compute the language-model-head gradient from softmax probabilities.

The starter leaks the final token into every context, drops the residual path,
and returns a zero gradient. Run:

```bash
pnpm exec vitest run exercises/tiny-transformer-capstone/tests --config vitest.exercise.config.ts
```
