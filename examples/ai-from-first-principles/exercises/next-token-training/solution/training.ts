export function nextTokenPairs(
  tokenIds: number[],
): Array<{ input: number; target: number }> {
  if (tokenIds.length < 2) {
    throw new RangeError("next-token training needs at least two tokens");
  }
  return tokenIds.slice(0, -1).map((input, position) => ({
    input,
    target: tokenIds[position + 1] ?? -1,
  }));
}

function softmax(logits: number[]): number[] {
  const maximum = Math.max(...logits);
  const exponents = logits.map((logit) => Math.exp(logit - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

function validate(weights: number[][], tokenIds: number[]): number {
  if (weights.length === 0) throw new RangeError("weights must not be empty");
  const vocabularySize = weights.length;
  if (
    weights.some((row) => row.length !== vocabularySize) ||
    weights.some((row) => row.some((value) => !Number.isFinite(value)))
  ) {
    throw new RangeError("weights must be one finite square matrix");
  }
  if (
    tokenIds.some(
      (tokenId) =>
        !Number.isInteger(tokenId) || tokenId < 0 || tokenId >= vocabularySize,
    )
  ) {
    throw new RangeError("token id is outside the vocabulary");
  }
  return vocabularySize;
}

export function meanLoss(weights: number[][], tokenIds: number[]): number {
  validate(weights, tokenIds);
  const pairs = nextTokenPairs(tokenIds);
  return (
    pairs.reduce((sum, pair) => {
      const probabilities = softmax(weights[pair.input] ?? []);
      return sum - Math.log(probabilities[pair.target] ?? 0);
    }, 0) / pairs.length
  );
}

export function trainStep(
  weights: number[][],
  tokenIds: number[],
  learningRate: number,
): number[][] {
  const vocabularySize = validate(weights, tokenIds);
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new RangeError("learning rate must be positive and finite");
  }
  const pairs = nextTokenPairs(tokenIds);
  const gradients = Array.from({ length: vocabularySize }, () =>
    Array.from({ length: vocabularySize }, () => 0),
  );
  for (const pair of pairs) {
    const probabilities = softmax(weights[pair.input] ?? []);
    const row = gradients[pair.input];
    if (!row) throw new RangeError("missing gradient row");
    probabilities.forEach((probability, target) => {
      row[target] = (row[target] ?? 0) + probability - (target === pair.target ? 1 : 0);
    });
  }
  const scale = learningRate / pairs.length;
  return weights.map((row, input) =>
    row.map((weight, target) => weight - scale * (gradients[input]?.[target] ?? 0)),
  );
}
