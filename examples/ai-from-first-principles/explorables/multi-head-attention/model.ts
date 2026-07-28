import {
  dot,
  linearLayer,
  matrixShape,
  type Matrix,
  type Vector,
} from "../linear-layers/model.ts";

export interface AttentionHead {
  weights: Matrix;
  output: Matrix;
}

export interface MultiHeadResult {
  queries: Matrix;
  keys: Matrix;
  values: Matrix;
  heads: AttentionHead[];
  concatenated: Matrix;
  output: Matrix;
}

export interface AttentionParameters {
  queryWeights: Matrix;
  keyWeights: Matrix;
  valueWeights: Matrix;
  outputWeights: Matrix;
}

export function projectSequence(sequence: Matrix, weights: Matrix): Matrix {
  const [outputs] = matrixShape(weights);
  return sequence.map((vector) =>
    linearLayer(
      vector,
      weights,
      Array.from({ length: outputs }, () => 0),
    ),
  );
}

export function splitHeads(vector: Vector, headCount: number): Matrix {
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

export function combineHeads(heads: Matrix): Vector {
  if (heads.length === 0) throw new RangeError("heads must not be empty");
  const width = heads[0]?.length ?? 0;
  if (width === 0 || heads.some((head) => head.length !== width)) {
    throw new RangeError("heads must have one consistent positive width");
  }
  return heads.flat();
}

function maskedSoftmax(scores: Vector): Vector {
  if (
    scores.length === 0 ||
    scores.some((score) => Number.isNaN(score) || score === Number.POSITIVE_INFINITY)
  ) {
    throw new RangeError("attention scores must be finite or negative infinity");
  }
  const maximum = Math.max(...scores);
  if (maximum === Number.NEGATIVE_INFINITY) {
    return scores.map(() => 0);
  }
  const exponents = scores.map((score) => Math.exp(score - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function scaledAttention(
  queries: Matrix,
  keys: Matrix,
  values: Matrix,
  causal: boolean,
): AttentionHead {
  if (
    queries.length === 0 ||
    queries.length !== keys.length ||
    queries.length !== values.length
  ) {
    throw new RangeError("queries, keys, and values need equal sequence lengths");
  }
  const width = queries[0]?.length ?? 0;
  if (
    width === 0 ||
    queries.some((row) => row.length !== width) ||
    keys.some((row) => row.length !== width) ||
    values.some((row) => row.length !== width)
  ) {
    throw new RangeError("queries, keys, and values need one shared head width");
  }
  const weights = queries.map((query, row) => {
    const scores = keys.map((key, column) =>
      causal && column > row
        ? Number.NEGATIVE_INFINITY
        : dot(query, key) / Math.sqrt(width),
    );
    return maskedSoftmax(scores);
  });
  const output = weights.map((row) =>
    Array.from({ length: width }, (_, dimension) =>
      row.reduce(
        (sum, weight, column) => sum + weight * (values[column]?.[dimension] ?? 0),
        0,
      ),
    ),
  );
  return { weights, output };
}

export function multiHeadAttention(
  sequence: Matrix,
  parameters: AttentionParameters,
  headCount: number,
  causal = true,
  shareFirstHead = false,
): MultiHeadResult {
  const queries = projectSequence(sequence, parameters.queryWeights);
  const keys = projectSequence(sequence, parameters.keyWeights);
  const values = projectSequence(sequence, parameters.valueWeights);
  const queryHeads = queries.map((vector) => splitHeads(vector, headCount));
  const keyHeads = keys.map((vector) => splitHeads(vector, headCount));
  const valueHeads = values.map((vector) => splitHeads(vector, headCount));
  const heads = Array.from({ length: headCount }, (_, head) => {
    const selected = shareFirstHead ? 0 : head;
    return scaledAttention(
      queryHeads.map((token) => token[selected] ?? []),
      keyHeads.map((token) => token[selected] ?? []),
      valueHeads.map((token) => token[selected] ?? []),
      causal,
    );
  });
  const concatenated = sequence.map((_, token) =>
    combineHeads(heads.map((head) => head.output[token] ?? [])),
  );
  const output = projectSequence(concatenated, parameters.outputWeights);
  return { queries, keys, values, heads, concatenated, output };
}
