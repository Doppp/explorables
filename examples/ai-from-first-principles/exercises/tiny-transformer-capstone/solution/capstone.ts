function validateFinite(vector: number[], width: number, name: string): void {
  if (vector.length !== width || vector.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain ${width} finite values`);
  }
}

export function shiftedExamples(tokens: number[]): Array<{
  context: number[];
  target: number;
}> {
  if (tokens.length < 2) {
    throw new RangeError("next-token training needs at least two tokens");
  }
  tokens.forEach((token) => {
    if (!Number.isInteger(token) || token < 0) {
      throw new RangeError("token ids must be non-negative integers");
    }
  });
  return tokens.slice(1).map((target, index) => ({
    context: tokens.slice(0, index + 1),
    target,
  }));
}

export function causalAttentionWithResidual(
  query: number[],
  keys: number[][],
  values: number[][],
): number[] {
  if (query.length === 0 || keys.length === 0 || keys.length !== values.length) {
    throw new RangeError("attention needs a query and matching keys and values");
  }
  keys.forEach((key) => {
    validateFinite(key, query.length, "key");
  });
  values.forEach((value) => {
    validateFinite(value, query.length, "value");
  });
  validateFinite(query, query.length, "query");
  const scores = keys.map(
    (key) =>
      key.reduce((sum, value, index) => sum + value * (query[index] ?? 0), 0) /
      Math.sqrt(query.length),
  );
  const maximum = Math.max(...scores);
  const exponents = scores.map((score) => Math.exp(score - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  const weights = exponents.map((value) => value / total);
  const update = Array.from({ length: query.length }, (_, dimension) =>
    weights.reduce(
      (sum, weight, index) => sum + weight * (values[index]?.[dimension] ?? 0),
      0,
    ),
  );
  return query.map((value, index) => value + (update[index] ?? 0));
}

export function outputGradient(
  hidden: number[],
  probabilities: number[],
  target: number,
): number[][] {
  if (
    hidden.length === 0 ||
    probabilities.length === 0 ||
    !Number.isInteger(target) ||
    target < 0 ||
    target >= probabilities.length
  ) {
    throw new RangeError("gradient needs hidden state, probabilities, and target");
  }
  validateFinite(hidden, hidden.length, "hidden state");
  validateFinite(probabilities, probabilities.length, "probabilities");
  return probabilities.map((probability, token) =>
    hidden.map((value) => (probability - (token === target ? 1 : 0)) * value),
  );
}
