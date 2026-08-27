# AI from First Principles glossary

This course assumes basic programming knowledge but no prior AI or machine-learning vocabulary.
The first definition under each term is the one used when the term first appears. Later notes make
the idea more precise without invalidating the beginner definition.

## Input

Information supplied to a program or model. A photo supplied to a photo-tagging program is an
input.

## Output

Information returned by a program or model. The label `dog` can be an output.

## Component

One part of a larger program with a particular responsibility. A model can be one component inside
a complete chat product.

## Category

One of the groups something may belong to, such as `cat`, `dog`, or `bird`.

## Label

The name assigned to a category. If a photo is placed in the dog category, `dog` is its label.

## Classification and classifier

**Classification** means choosing which predefined category an input belongs to. A **classifier**
is a program or model that performs classification. It selects a label; it does not construct a
new image or paragraph.

## Model

A component that converts an input into a prediction or output. A learned model contains adjustable
numbers called parameters; later lessons show how training changes them.

## Learned model

A model whose behaviour was shaped by adjusting parameters using examples. This differs from a
programmer writing a direct rule for every decision.

## Parameter

An adjustable number inside a learned model. Training changes parameters; ordinary inference uses
their current values.

## Generative AI

A learned system that constructs content such as text, images, audio, video, or code. “New” here
means constructed rather than selected as one category label; it does not claim that the result is
unprecedented or creative in the human sense.

## Language model and LLM

A **language model** assigns likelihoods to possible pieces of language. Given the language so far,
it can score possible next pieces. **LLM** means “large language model”: a language model with a
large number of learned parameters, trained with substantial data and computation. It is still a
model, not the entire chat product.

## Token

One numbered piece of text used by a language model. A token may be a whole word, part of a word,
punctuation, or another text fragment.

## Product

The complete application used by a person. A chat product may combine a language model with an
interface, conversation history, instructions, retrieval, tools, and safety controls.

## Prediction

A model's proposed output for an input. A classifier may predict a label; a language model may
predict likelihoods for possible next tokens.

## Target

The answer used as a comparison during training. The difference between a prediction and its target
provides a signal for changing the model.

## Training

The process that adjusts a model's parameters using examples and an objective. Training changes the
model.

## Inference

Using a model with its current parameters to produce a prediction or output. Ordinary inference
does not update the learned parameters. In logic, “inference” can mean drawing a conclusion; in this
course, the unqualified term normally means running a trained model.

## Generation

Constructing content through one or more inference steps. A language model can generate text by
scoring a next token, selecting one, adding it to the text, and repeating.

## Reasoning

Using intermediate relationships or steps to reach an answer. In an AI product, problem-solving
behaviour may come from model inference, repeated model calls, product instructions, search, code
execution, or other tools. A generated step-by-step explanation is output, not guaranteed proof of
the model's private internal computation, and fluency is not proof of correctness.

## Boundary

The dividing line between two responsibilities or ideas. The model–product boundary separates the
work performed by the learned model from work performed by the surrounding application.
