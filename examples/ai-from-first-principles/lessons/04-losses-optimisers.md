---
id: losses-optimisers
title: Losses and optimisers
order: 4
checkpoints:
  - { id: predict, title: "Record your prediction", completion: learner }
  - { id: experiment, title: "Take a training step", completion: explorable-event, instanceId: optimiser-lab, event: simulation-completed }
  - { id: implement, title: "Attempt the exercise and run its tests", completion: learner }
  - { id: explain, title: "Explain the result and one failure mode", completion: learner }
objectives:
  - relate logits, probabilities, targets, and cross-entropy
  - explain stable softmax and global gradient clipping
  - compare SGD, momentum, and AdamW parameter updates
prerequisites:
  - vectors-matrices-linear-layers
---

# Losses and optimisers

The linear layer produces logits. Softmax turns them into probabilities, and
cross-entropy measures how much probability the model assigned to the target.
An optimiser then converts the loss gradient into a parameter update.

> **Predict:** If the target is `dog`, what happens to the loss when only the
> dog logit increases? What happens if the same `+1000` offset is added to every
> logit?

:::explorable{src="../explorables/losses-optimisers/index.ts" title="Linear classifier loss and optimiser arena" height="690" id="optimiser-lab"}
Train a three-class linear classifier using SGD, momentum, or AdamW. The arena
shows logits, probabilities, cross-entropy, gradient and update norms, optimiser
state, and loss history. A shared logit offset demonstrates stable softmax;
broken modes expose numerical overflow and the loss of optimiser memory.
:::

## Stress the invariants

Set the shared logit offset to `1000`. Stable softmax produces the same
probabilities and loss because adding one constant does not change relative
logits. Enable naive softmax: direct exponentiation overflows even though the
underlying distribution is ordinary.

Choose momentum and take several steps, then reset optimiser state on every
step. The model still follows the current gradient, but it can no longer
accumulate a direction across updates.

:::exercise{path="../exercises/losses-optimisers" command="pnpm exec vitest run exercises/losses-optimisers/tests --config vitest.exercise.config.ts" title="Implement stable loss and a momentum update"}
Implement stable softmax, cross-entropy, global-norm clipping, and a stateful
momentum update with decoupled weight decay. The starter exponentiates raw
logits, clips components independently, and forgets its previous velocity.
:::

## In real models

Released models combine the same next-token cross-entropy objective with
carefully chosen optimisation, precision, clipping, and scheduling rules.
Model-specific courses compare those published choices only after fixing the
objective and numerical invariants established here.

## Explain and transfer

Why can two optimisers receiving the same gradient make different updates?
Why does clipping one unusually large gradient differ from permanently lowering
the learning rate? Later, the next-token objective will apply the same
cross-entropy calculation at every sequence position.
