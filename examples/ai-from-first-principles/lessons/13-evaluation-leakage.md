---
id: evaluation-leakage
title: Evaluation leakage
order: 16
discoveryCycle: true
checkpoints:
  - id: predict
    title: "Record your prediction"
    phase: predict
    completion: learner
    response:
      format: short-text
      prompt: "Which split will score higher, and which claim will each score support?"
  - { id: experiment, title: "Save an evaluation-split experiment", phase: experiment, completion: explorable-event, instanceId: leakage-lab, event: experiment-recorded }
  - { id: implement, title: "Attempt the exercise and run its tests", phase: apply, completion: learner }
  - id: explain
    title: "State the supported claim and one failure mode"
    phase: reflect
    completion: learner
    response:
      format: long-text
      prompt: "What claim does your evidence support, and what does it not establish?"
objectives:
  - distinguish examples from independent task families
  - identify contamination across a train-test boundary
  - design a grouped evaluation split
  - state a reproducible claim supported by the chosen split
---

# Evaluation leakage

Imagine an evaluation set made from four underlying programming tasks, `A` through
`D`. Each task has three lightly rewritten variants: `A-1`, `A-2`, `A-3`, and so on.
The words differ between variants, but solving one may make its siblings easy to
recognise.

An **example-level split** assigns individual rows to training or test. A
**family-level split** treats all variants of the same underlying task as one unit
and assigns that whole unit to one side. The model in the laboratory is a deliberately
limited **memoriser**: it succeeds on a test variant only when its family occurred in
training.

> **Predict:** Will a random example-level split or a family-level split report higher accuracy for a memorising system? Which result better estimates a new family?

Record both the expected score ordering and the claim you think each score could
support. Do this before enabling leakage or saving a run.

:::explorable{src="../explorables/leakage/index.ts" title="Evaluation leakage split laboratory" height="570" id="leakage-lab"}
Choose how many task families and variants to create, then compare two split units. The laboratory exposes which test families occurred in training and lets you save the resulting scores as evidence.
:::

## Generate and compare evidence

Complete the experiment phase before reading the formal diagnosis.

1. Leave **Leak task families across the boundary** off. Inspect every test row's
   **family seen in train?** value, then save this grouped split as evidence.
2. Turn leakage on without changing the family or variant counts. Inspect the same
   column and save a second run.
3. Compare the saved inputs, number of test examples, leaked-test count, score, and
   summary. The rows are the evidence behind the headline accuracy.
4. Change the number of variants. Ask whether adding correlated rewrites creates
   more independent evidence about new task families.

Turn leakage on and inspect test rows marked “family seen in train.” The score is reproducible and still invalid for the stated claim.

## Disjoint rows are not necessarily independent units

A train and test set are **example-disjoint** when no exact row appears in both.
That condition is useful, but it is not enough when different rows share the
identity the system can memorise. Two paraphrases of one problem, adjacent chunks
from one document, or commits from one repository can be distinct rows while
carrying nearly the same signal.

The **evaluation unit** should match the intended generalisation claim. If the claim
is “works on unseen task families,” the family—not the rewritten row—is the unit
that must cross neither side of the train/test boundary. “Independent unit” here
means a unit kept intact for the claim; it does not promise that real-world families
are perfectly statistically independent.

With four families and three variants, the laboratory's example split alternates
rows between train and test. Every family then has at least one training row and at
least one test row. The memoriser scores `100%` because all test families are known.
The rows are disjoint, but the unit relevant to new-family transfer leaked.

The alternation is deterministic so the laboratory produces reproducible evidence;
it stands in for the same family-mixing risk created by a random example-level
split. Randomness does not make correlated variants independent.

The grouped run places complete families on one side. Its test families do not
occur in training, so this deliberately pure memoriser scores `0%`. That number is
not a claim about every useful model; it is a diagnostic baseline showing exactly
what family recognition can and cannot solve.

## State the claim before choosing the split

An evaluation result is meaningful only relative to a question. Compare these two:

- “Can the system handle a new rewrite from a task family it has already seen?”
- “Can the system handle a task family absent from training?”

An example-level split may provide evidence for the first question if its deployment
conditions truly include familiar families. It cannot, by itself, support the
second. A family-level split is aligned with the second question, but still does not
establish transfer to every domain, difficulty, language, or future data source.

This is why a lower, correctly scoped score can be more informative than a higher
mis-scoped score. Leakage does not mean that the arithmetic is unreproducible. It
means information crossed a boundary that the stated claim required to remain
separate.

## Training, model selection, and final evaluation

Keep three roles separate:

- **Training data** contributes directly to parameter updates.
- **Validation data** may guide choices such as hyperparameters, prompts, stopping
  points, or decoding settings.
- **Test data** is reserved for the final stated evaluation after those choices are
  fixed.

Evaluation normally runs the model in inference mode with its state fixed; labels
are used for scoring, not learning. Repeatedly changing a prompt, checkpoint, or
decoding policy because of test results turns the test set into selection feedback,
even if no gradient update occurs. A fresh held-out set or a correctly nested
procedure is then needed for an honest final claim.

The grouping key must be chosen before the split using provenance that captures the
real dependency. A filename is insufficient if several files came from one
repository; a user ID is insufficient if multiple IDs belong to one organisation.
Inspect data lineage rather than assuming row IDs imply independence.

The capstone makes the same failure concrete: its cyclic training corpus is easy to fit, while a held-out corpus follows a different transition pattern. Reporting training accuracy as held-out performance changes the claim without changing a single prediction.

## Connect the evidence to code

The laboratory makes the evaluation pipeline inspectable:

```text
examples with family provenance
  → choose the unit required by the claim
  → assign complete units to train or test deterministically
  → verify that no test unit appears in training
  → freeze model and evaluation protocol
  → run predictions and compute the metric
  → report the score together with its supported claim
```

A useful safety assertion compares the set of training group IDs with the set of
test group IDs and rejects any overlap. That check complements—not replaces—manual
review of whether the chosen ID represents the real dependency.

:::exercise{path="../exercises/leakage" command="pnpm exec vitest run exercises/leakage/tests --config vitest.exercise.config.ts" title="Create a leakage-safe split"}
Implement a deterministic grouped split. The starter alternates rows deterministically between train and test instead of keeping task families intact. Add one test based on a family/variant combination you created in the laboratory.
:::

Use a saved laboratory run to design your additional test, but attempt the
implementation before asking for a hint. Afterward, run the supplied command and
explain whether a failing case shows family overlap, nondeterminism, lost input
order, or an invalid test partition. A passing implementation still needs a verbal
claim about the population it represents.

## Common failure modes

- **Grouping by row instead of source identity:** exact duplicates are absent, but
  siblings cross the boundary.
- **Choosing the grouping key after seeing scores:** the test result influences the
  protocol it is supposed to assess.
- **Fitting preprocessing on all data:** vocabulary, normalisation statistics,
  deduplication decisions, or feature selection can leak test information before
  model training begins.
- **Using the test set for prompt or decoding-policy tuning:** selection feedback
  contaminates the final evaluation even without parameter updates.
- **Temporal leakage:** training includes data created after the evaluation cutoff,
  or a feature contains future information unavailable at deployment time.
- **Counting variants as independent trials:** confidence may look much stronger
  than the number of independent families warrants.
- **Reporting only accuracy:** a score without corpus version, grouping rule, model
  state, and protocol hides what was actually measured.

## In real models

Frontier-model tables combine model weights, prompts, tools, harnesses, sampling, and benchmark versions. The shared research course turns those release artifacts into explicit evidence, while each specialization labels claims as reported, reproduced, or inferred.

## Recap and self-check

Evaluation leakage occurs when information relevant to the test unit influences
training or selection despite the intended boundary. Exact row separation is weaker
than group separation when rows share a task, user, repository, document, or time
source. The correct split is determined by the claim, and the claim must remain no
broader than the population and protocol actually tested.

Reflect on the evidence you saved:

1. Why can train and test rows be disjoint while their evaluation units overlap?
2. What did the example-level score measure in the memoriser laboratory? What did
   it fail to estimate?
3. Name two other identities—user, repository, time window, document source—that
   might need grouping in a real evaluation. What claim would each grouping support?
4. How can a test set become contaminated when model parameters are never updated on
   it?
5. State one claim supported by your grouped run and one broader claim it does not
   establish.

Write down the corpus version, grouping key, split procedure, model state, decoding policy, metric, and random seed or deterministic tie-breaking rule. Another person should be able to recreate the score and determine exactly which generalisation claim it does—and does not—support.
