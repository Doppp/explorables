export function splitHeads(vector: number[], headCount: number): number[][] {
  if (
    !Number.isInteger(headCount) ||
    headCount <= 0 ||
    vector.length % headCount !== 0
  ) {
    throw new RangeError("vector width must divide evenly across positive heads");
  }
  const width = vector.length / headCount;
  return Array.from({ length: headCount }, (_, head) =>
    vector.slice(head * width, (head + 1) * width),
  );
}

export function combineHeads(heads: number[][]): number[] {
  if (heads.length === 0) throw new RangeError("heads must not be empty");
  const width = heads[0]?.length ?? 0;
  if (width === 0 || heads.some((head) => head.length !== width)) {
    throw new RangeError("heads must have one shared positive width");
  }
  return heads.flat();
}

function softmax(scores: number[]): number[] {
  const maximum = Math.max(...scores);
  const exponents = scores.map((score) => Math.exp(score - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function multiHeadAttention(
  queries: number[][],
  keys: number[][],
  values: number[][],
  headCount: number,
  causal = true,
): { weights: number[][][]; output: number[][] } {
  if (
    queries.length === 0 ||
    queries.length !== keys.length ||
    queries.length !== values.length
  ) {
    throw new RangeError("queries, keys, and values need equal sequence lengths");
  }
  const queryHeads = queries.map((vector) => splitHeads(vector, headCount));
  const keyHeads = keys.map((vector) => splitHeads(vector, headCount));
  const valueHeads = values.map((vector) => splitHeads(vector, headCount));
  const headWidth = queryHeads[0]?.[0]?.length ?? 0;
  const weights = Array.from({ length: headCount }, (_, head) =>
    queries.map((_, row) => {
      const scores = keys.map((__, column) => {
        if (causal && column > row) return Number.NEGATIVE_INFINITY;
        return (
          (queryHeads[row]?.[head] ?? []).reduce(
            (sum, value, index) =>
              sum + value * (keyHeads[column]?.[head]?.[index] ?? 0),
            0,
          ) / Math.sqrt(headWidth)
        );
      });
      return softmax(scores);
    }),
  );
  const output = queries.map((_, token) =>
    combineHeads(
      weights.map((headWeights, head) =>
        Array.from(
          { length: headWidth },
          (__, dimension) =>
            headWeights[token]?.reduce(
              (sum, weight, source) =>
                sum + weight * (valueHeads[source]?.[head]?.[dimension] ?? 0),
              0,
            ) ?? 0,
        ),
      ),
    ),
  );
  return { weights, output };
}
