---
id: evaluation-leakage
title: Evaluation leakage
order: 6
objectives:
  - distinguish examples from independent task families
  - identify contamination across a train-test boundary
  - design a grouped evaluation split
---

# Evaluation leakage

A split can be technically disjoint while still leaking the answer. Here each
task family has several lightly rewritten variants.

> **Predict:** Will a random example-level split or a family-level split report
> higher accuracy for a memorising system? Which result better estimates a new
> family?

:::explorable{src="../explorables/leakage/index.ts" title="Evaluation leakage split laboratory" height="570"}
The laboratory assigns task variants to train or test. With leakage enabled,
variants from the same family cross the boundary and a memoriser appears
accurate. Grouped splitting keeps families intact and exposes generalisation.
:::

## Diagnose the flattering score

Turn leakage on and inspect test rows marked “family seen in train.” The score
is reproducible and still invalid for the stated claim.

:::exercise{path="../exercises/leakage" command="pnpm exec vitest run exercises/leakage/tests --config vitest.exercise.config.ts" title="Create a leakage-safe split"}
Implement a deterministic grouped split. The starter shuffles examples rather
than task families.
:::

## Explain and transfer

Name two other identities—user, repository, time window, document source—that
might need grouping in a real evaluation. What claim does each split support?
