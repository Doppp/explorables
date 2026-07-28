# AI from First Principles v0.2 course brief

Status: implementation and automated verification complete
Depends on: the existing v0.1 six-lesson vertical slice

## Promise

Build enough of a small autoregressive Transformer to explain how tokens become
predictions, how training changes its parameters, how cached inference produces
tokens, and how evaluation can overstate its ability.

## Audience and prerequisites

The audience remains software developers and computer science graduates with
basic TypeScript, algebra, and array programming. No prior machine-learning
framework experience is required.

## Learning outcomes

After completing the course, a learner can:

- track tensor shapes through linear algebra operations;
- derive and implement gradients for small computation graphs;
- explain cross-entropy and next-token training;
- implement tokenisation, embeddings, causal multi-head attention, an MLP,
  residual connections, and normalisation;
- assemble and train a small Transformer;
- distinguish prefill from decoding and explain KV-cache costs;
- control decoding without confusing logits with probabilities;
- design an evaluation split that matches its generalisation claim.

## Curriculum

### Module A — learning

1. **Gradient descent** — existing: local slope, learning rate, convergence,
   divergence, and one update.
2. **Backpropagation** — existing: forward values, local derivatives, chain
   rule, and finite-difference checks.
3. **Vectors, matrices, and linear layers** — new: shapes, matrix
   multiplication, projections, bias, and batches.
4. **Losses and optimisers** — new: stable cross-entropy, momentum, AdamW,
   gradient norms, and clipping.

### Module B — representing language

5. **BPE tokenisation** — existing: deterministic pair counting, merge order,
   and vocabulary construction.
6. **Embeddings and positional information** — new: lookup tables, vector
   similarity, position dependence, and RoPE intuition.

### Module C — building a Transformer

7. **Self-attention** — existing and extended: queries, keys, values, causal
   masking, stable softmax, and weighted outputs.
8. **Multi-head attention** — new: learned projections, head splitting,
   concatenation, and output projection.
9. **The Transformer block** — new: RMSNorm, residual streams, attention,
   SwiGLU/MLP, and shape invariants.
10. **Next-token training** — new: shifted targets, causal loss, batching,
    forward/backward passes, and updates.

### Module D — running and evaluating it

11. **Autoregressive inference and KV caching** — new: prefill, decoding,
    cached keys and values, recomputation, and memory growth.
12. **Sampling and generation** — existing: temperature, top-k, nucleus
    sampling, and truncation ordering.
13. **Evaluation leakage** — existing and extended: contamination, grouped
    splits, benchmark claims, and reproducibility.

## Explorable plan

| Lesson | Learner-controlled explorable |
| --- | --- |
| Gradient descent | Step across a loss curve while changing learning rate |
| Backpropagation | Inspect forward and backward values in a computation graph |
| Vectors and matrices | Pass shaped tensors through a matrix pipeline |
| Losses and optimisers | Compare loss surfaces and optimiser update paths |
| BPE | Apply merges and inspect the evolving vocabulary |
| Embeddings and position | Manipulate token vectors and RoPE rotations |
| Self-attention | Edit scores, masks, probabilities, and value mixing |
| Multi-head attention | Split projections and compare head behaviour |
| Transformer block | Trace a token through norm, attention, residual, and MLP |
| Next-token training | Debug batch and target alignment while loss updates |
| KV caching | Compare prefill/decode work and cache memory token by token |
| Sampling | Manipulate temperature, top-k, and top-p |
| Evaluation | Compare leakage-prone and claim-aligned evaluation designs |

Every explorable must expose internal state, a deliberate broken mode, keyboard
operation, and a useful text alternative. It must support the lesson rather
than merely animate its terminology.

## Capstone

The learner assembles a deterministic tiny TypeScript Transformer from the
components implemented during the course. It must:

- tokenise a fixed small corpus;
- train on a next-token objective;
- demonstrate decreasing loss;
- generate a short sequence;
- support cached and uncached inference;
- expose selected intermediate tensors;
- contain testable failures in masking, shapes, residuals, and evaluation.

The capstone is a conceptual reference implementation, not a production
training framework or performance benchmark.

## Boundary with Open Frontier Models

The advanced course may assume only the outcomes listed in this brief. Each
advanced lesson must link its baseline mechanism to a specific foundation
lesson and capstone artifact. If a frontier lesson requires an unlisted
concept, that concept must be added here or taught explicitly as part of the
advanced lesson.

## Acceptance criteria

- All thirteen lessons are ordered, reachable, and readable as plain Markdown.
- Each new lesson satisfies the repository lesson definition of done.
- Existing lesson identifiers and learner work remain migratable.
- The capstone passes deterministic model, gradient, training, generation, and
  cache-equivalence tests.
- Browser tests cover navigation, meaningful interaction, error isolation,
  accessibility, keyboard operation, and narrow desktop layout.
- A clean learner copy installs, validates, tests, and builds without a GPU or
  network service.
