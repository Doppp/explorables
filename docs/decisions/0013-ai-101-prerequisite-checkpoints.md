# ADR 0013: Make prerequisite vocabulary visible before prediction

## Status

Accepted

## Context

The first tutor-led beginner checkpoint asked learners to classify AI products before confirming
that words such as classifier, label, learned model, generative, LLM, product, and boundary were
usable. Canonical lesson Markdown contained definitions, but tutor-led presentation collapsed that
prerequisite prose and foregrounded the prediction. A programming-literate learner with no ML
vocabulary could therefore be blocked at the first step despite matching the declared audience.

## Decision

Add optional `prepare` and `check` checkpoint phases. In tutor-led courses, render the canonical
lesson introduction—including vocabulary, examples, non-examples, and worked setup—on the activity
surface before the active checkpoint. `prepare` records vocabulary orientation; `check` records a
concrete recognition task; prediction follows only after those prerequisites are complete.

Keep definitions in ordinary Markdown and add no custom directive, second progress store, account,
grading system, or private host bridge. Teach inference, generation, and reasoning as distinct
terms. Generated reasoning prose is observable output to verify, not guaranteed access to private
model computation or proof of correctness.

## Consequences

- Tutor-led pages carry more prerequisite prose in the activity surface, but learners no longer
  need to discover essential definitions inside collapsed notes.
- Existing courses and checkpoints remain valid because both phases are optional.
- Discovery-cycle validation continues to require predict, experiment, apply, and reflect in order;
  prepare and check may precede them.
- Instructional sufficiency still requires editorial review and consented learner playtesting.
