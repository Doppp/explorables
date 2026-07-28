export function splitHeads(vector: number[], headCount: number): number[][] {
  const heads = Array.from({ length: headCount }, () => [] as number[]);
  vector.forEach((value, index) => {
    heads[index % headCount]?.push(value);
  });
  return heads;
}

export function combineHeads(heads: number[][]): number[] {
  return heads.flat();
}

export function multiHeadAttention(
  queries: number[][],
  keys: number[][],
  values: number[][],
  headCount: number,
  causal = true,
): { weights: number[][][]; output: number[][] } {
  const queryHeads = queries.map((vector) => splitHeads(vector, headCount));
  const keyHeads = keys.map((vector) => splitHeads(vector, headCount));
  const valueHeads = values.map((vector) => splitHeads(vector, headCount));
  const weights = Array.from({ length: headCount }, (_, head) =>
    queries.map((_, row) => {
      const scores = keys.map((__, column) =>
        (queryHeads[row]?.[head] ?? []).reduce(
          (sum, value, index) => sum + value * (keyHeads[column]?.[head]?.[index] ?? 0),
          0,
        ),
      );
      const exponents = scores.map(Math.exp);
      const total = exponents.reduce((sum, value) => sum + value, 0);
      return exponents.map((value, column) =>
        causal && column > row ? 0 : value / total,
      );
    }),
  );
  const output = queries.map((_, token) =>
    combineHeads(
      weights.map((headWeights, head) =>
        Array.from(
          { length: valueHeads[token]?.[head]?.length ?? 0 },
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
