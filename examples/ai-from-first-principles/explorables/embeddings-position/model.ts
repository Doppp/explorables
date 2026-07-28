import type { Matrix, Vector } from "../linear-layers/model.ts";

function assertFinite(values: number[], name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite numbers`);
  }
}

export function embeddingLookup(table: Matrix, tokenIds: number[]): Matrix {
  if (table.length === 0) throw new RangeError("embedding table must not be empty");
  const width = table[0]?.length ?? 0;
  if (
    width === 0 ||
    table.some((row) => row.length !== width) ||
    table.some((row) => row.some((value) => !Number.isFinite(value)))
  ) {
    throw new RangeError("embedding table must be rectangular and finite");
  }
  return tokenIds.map((tokenId) => {
    if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId >= table.length) {
      throw new RangeError(`token id ${tokenId} is outside the embedding table`);
    }
    return [...(table[tokenId] ?? [])];
  });
}

export function cosineSimilarity(left: Vector, right: Vector): number {
  if (left.length !== right.length || left.length === 0) {
    throw new RangeError("cosine similarity needs equal non-empty vectors");
  }
  assertFinite(left, "left vector");
  assertFinite(right, "right vector");
  const dot = left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
  const denominator = Math.hypot(...left) * Math.hypot(...right);
  return denominator === 0 ? 0 : dot / denominator;
}

export function rotatePairs(vector: Vector, position: number, base = 10_000): Vector {
  if (vector.length === 0 || vector.length % 2 !== 0) {
    throw new RangeError("RoPE needs a non-empty even-width vector");
  }
  if (!Number.isInteger(position) || position < 0) {
    throw new RangeError("position must be a non-negative integer");
  }
  if (!(base > 1) || !Number.isFinite(base)) {
    throw new RangeError("RoPE base must be finite and greater than one");
  }
  assertFinite(vector, "vector");
  const rotated: number[] = [];
  for (let offset = 0; offset < vector.length; offset += 2) {
    const pair = offset / 2;
    const inverseFrequency = base ** (-(2 * pair) / vector.length);
    const angle = position * inverseFrequency;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const first = vector[offset] ?? 0;
    const second = vector[offset + 1] ?? 0;
    rotated.push(first * cosine - second * sine, first * sine + second * cosine);
  }
  return rotated;
}
