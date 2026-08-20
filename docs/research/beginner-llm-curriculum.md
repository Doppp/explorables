# Beginner LLM curriculum research

Reviewed: 20 August 2026

This note records curriculum evidence, not instructions for the implementation agent. Product
decisions remain governed by `docs/PRD.md`.

## Reviewed starting points

- 3Blue1Brown's lightweight LLM introduction, Transformer overview, and step-by-step attention
  lesson: https://www.3blue1brown.com/lessons/mini-llm/,
  https://www.3blue1brown.com/lessons/gpt/, and
  https://www.3blue1brown.com/lessons/attention/
- The Hacker Llama local-LLM glossary and linked operational concepts:
  https://osanseviero.github.io/hackerllama/blog/posts/hitchhiker_guide/
- The four supplied Reddit discussions and their repeatedly recommended paths: visual intuition,
  a tiny model from scratch, `Attention Is All You Need`, practical deep-learning material,
  hands-on inference, and small personally meaningful projects.
- Linked primary/foundational material, including the Transformer paper:
  https://arxiv.org/abs/1706.03762 and Practical Deep Learning for Coders:
  https://course.fast.ai/

## Conclusions used by the course

1. Begin with the observable product behaviour: text enters, a distribution over possible next
   tokens comes out, one token is selected, and the loop repeats.
2. Define the nesting before using the jargon: AI is the broad field; machine learning is one way
   to build AI systems; generative AI produces new content; an LLM is a language-focused learned
   model; a chatbot is a larger product system that uses a model.
3. Separate training from inference early. New learners otherwise commonly assume that a deployed
   chatbot updates its parameters during each conversation.
4. Use a tiny deterministic model to make mechanics inspectable, then name the abstraction gap:
   modern capability also depends on data, scale, post-training, evaluation, tools, retrieval, and
   product policy.
5. Introduce tokens and probabilities before embeddings or attention. Introduce gradients and
   backpropagation only after the learner has a concrete reason the probabilities must improve.
6. Pair visual inspection with code, tests, failure cases, and learner explanation. Reading alone
   and API-only tutorials do not establish the same mechanistic understanding.
7. Let the coding agent adapt the teaching loop. The browser should preserve evidence and enable
   manipulation, not deliver a competing wall of explanatory prose.

## Resulting sequence

1. Generative AI and language models
2. The next-token loop
3. How machines learn: training versus inference
4. Gradient descent and backpropagation
5. Vectors, losses, and optimisation
6. Tokenisation and numerical representations
7. Attention and Transformer blocks
8. Next-token training, inference, caching, and sampling
9. Evaluation and leakage

The sequence is intentionally spiral-shaped: the learner first sees the complete next-token loop,
then revisits each component with more mathematical and implementation detail.
