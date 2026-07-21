---
id: make-a-value-double
title: Make a value double
order: 1
objectives:
  - predict a simple numeric transformation
  - connect an interactive representation to TypeScript
---

# Make a value double

Before touching the control, predict the output when the input is **7**.

:::explorable{src="../explorables/double.ts" title="Doubling explorer" height="300"}
Move the input slider. The output is always twice the selected input, so an
input of 7 produces 14. The visible equation updates with the same values.
:::

## Implement it

:::exercise{path="../exercises/double" command="pnpm test" title="Implement double"}
Implement a pure function that doubles finite numbers, then inspect the failing
test for non-finite input.
:::

## Explain

Why might rejecting `Infinity` be preferable to returning `Infinity` in a
larger numeric pipeline?
