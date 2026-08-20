---
id: generative-ai-and-llms
title: Generative AI and language models
order: 1
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Classify a familiar AI product"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "Is a photo classifier generative AI, and is a chatbot the same thing as the language model inside it? Explain your current guess."
  - { id: experiment, title: "Compare and save two system profiles", phase: experiment, completion: explorable-event, instanceId: generative-ai-map, event: experiment-recorded }
  - { id: apply, title: "Name the model and product responsibilities", phase: apply, completion: learner }
  - id: reflect
    title: "Explain the term map"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "Explain how AI, machine learning, generative AI, an LLM, and a chatbot product relate without using them as synonyms."
objectives:
  - distinguish AI, machine learning, generative AI, language models, and chat products
  - separate a learned model from the larger software system that uses it
---

# Generative AI and language models

Before looking inside a language model, put the common terms in the right relationship. They
overlap, but none is a replacement name for all the others.

## A nested map, not a bag of synonyms

**Artificial intelligence (AI)** is the broad goal of making computer systems perform tasks that
seem to require perception, language, prediction, reasoning, or decision-making. An AI system can
use explicit rules, learned models, search, or several techniques together.

**Machine learning (ML)** is one way to build AI behaviour. Instead of programming every decision,
we give a model adjustable values called parameters and use data to find useful settings.

**Generative AI** describes learned systems that produce new content such as text, images, audio,
or code. A photo classifier can use machine learning without being generative: it chooses a label
for an existing image.

A **language model** assigns probabilities to sequences of language. A modern **large language
model (LLM)** has many learned parameters and is trained on a large amount of text or multimodal
data. “Large” describes scale, not a new kind of objective.

A **chatbot product** is not only an LLM. It normally combines a model with a conversation format,
system instructions, safety policy, tools, retrieval, memory supplied in the prompt, and a user
interface. The model generates tokens; the surrounding application decides what context and
capabilities the model receives.

> **Predict:** Is a learned photo classifier generative AI? Is a chat product identical to the LLM
> inside it? State which boundary makes each answer true or false.

:::explorable{src="../explorables/generative-ai-map/index.ts" title="AI, machine learning, generative AI, and LLM term map" height="430" id="generative-ai-map"}
Choose a rule-based system, learned classifier, image generator, or LLM chat product. The panel
shows whether each is learned, generative, language-focused, and a complete product system.
:::

## Explain the evidence

The examples form overlapping sets:

- a rule-based spell checker can be an AI system without machine learning;
- a learned photo classifier is ML but does not generate new content;
- an image generator is generative ML but is not a language model; and
- a chat application may use an LLM while still having important non-model components.

The last boundary matters when debugging. A wrong answer might come from model behaviour, missing
context, a retrieval error, a tool result, decoding settings, or application instructions. Calling
the whole product “the model” hides those different responsibilities.

## Apply the boundary

Take a coding-agent chat product as an example. With your tutor, name one responsibility belonging
to the model and three belonging to the surrounding product. Then choose which component you would
inspect if the system read the wrong file but produced fluent text about it.

## Failure boundary

The phrase “generative AI understands everything on the internet” collapses several claims. A model
learns statistical structure from its training process; it does not carry a verified database of
every source, and a chat product may add current information through tools or retrieval. Fluency is
not proof of factual access or correctness.

## Recap

You are ready to continue when you can draw the nested relationship and explain why a model, its
training process, and the product that calls it are three different things.
