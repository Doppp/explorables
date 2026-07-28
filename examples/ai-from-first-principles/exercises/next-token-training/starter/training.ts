export function nextTokenPairs(
  tokenIds: number[],
): Array<{ input: number; target: number }> {
  return tokenIds.slice(0, -1).map((input) => ({ input, target: input }));
}

function softmax(logits: number[]): number[] {
  const exponents = logits.map(Math.exp);
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function meanLoss(weights: number[][], tokenIds: number[]): number {
  const pairs = nextTokenPairs(tokenIds);
  return (
    pairs.reduce(
      (sum, pair) =>
        sum - Math.log(softmax(weights[pair.input] ?? [])[pair.target] ?? 0),
      0,
    ) / pairs.length
  );
}

export function trainStep(
  weights: number[][],
  tokenIds: number[],
  learningRate: number,
): number[][] {
  const next = weights.map((row) => [...row]);
  for (const pair of nextTokenPairs(tokenIds)) {
    const probabilities = softmax(weights[pair.input] ?? []);
    const row = next[pair.input];
    if (!row) continue;
    probabilities.forEach((probability, target) => {
      row[target] =
        (row[target] ?? 0) -
        learningRate * (probability - (target === pair.target ? 1 : 0));
    });
  }
  return next;
}
