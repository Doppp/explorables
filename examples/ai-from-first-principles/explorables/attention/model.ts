export function softmax(values: number[]): number[] {
  if (values.every((value) => value === Number.NEGATIVE_INFINITY))
    return values.map(() => 0);
  const maximum = Math.max(...values);
  const exponents = values.map((value) => Math.exp(value - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function attentionWeights(
  queries: number[],
  keys: number[],
  causal: boolean,
  brokenAfterSoftmax = false,
): number[][] {
  return queries.map((query, row) => {
    const scores = keys.map((key, column) =>
      causal && !brokenAfterSoftmax && column > row
        ? Number.NEGATIVE_INFINITY
        : query * key,
    );
    const weights = softmax(scores);
    return brokenAfterSoftmax && causal
      ? weights.map((weight, column) => (column > row ? 0 : weight))
      : weights;
  });
}
