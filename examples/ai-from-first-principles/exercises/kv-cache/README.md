# Implement incremental KV caching

Complete `starter/cache.ts`.

`appendCache` must return a new cache containing the previous entries followed by one key/value pair. `cachedAttention` must attend over every cached pair using scaled dot products and stable softmax.

The starter deliberately replaces the cache on every step, making a decoder forget the prompt. Run:

```bash
pnpm exec vitest run exercises/kv-cache/tests --config vitest.exercise.config.ts
```
