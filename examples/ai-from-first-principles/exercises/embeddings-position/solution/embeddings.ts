function assertFinite(values: number[], name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite values`);
  }
}

export function embeddingLookup(table: number[][], tokenIds: number[]): number[][] {
  if (table.length === 0) throw new RangeError("table must not be empty");
  const width = table[0]?.length ?? 0;
  if (
    width === 0 ||
    table.some((row) => row.length !== width) ||
    table.some((row) => row.some((value) => !Number.isFinite(value)))
  ) {
    throw new RangeError("table must be rectangular and finite");
  }
  return tokenIds.map((tokenId) => {
    if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId >= table.length) {
      throw new RangeError("token id is outside the table");
    }
    return [...(table[tokenId] ?? [])];
  });
}

export function rotatePairs(
  vector: number[],
  position: number,
  base = 10_000,
): number[] {
  if (vector.length === 0 || vector.length % 2 !== 0) {
    throw new RangeError("vector width must be positive and even");
  }
  if (!Number.isInteger(position) || position < 0) {
    throw new RangeError("position must be a non-negative integer");
  }
  if (!(base > 1) || !Number.isFinite(base)) {
    throw new RangeError("base must be finite and greater than one");
  }
  assertFinite(vector, "vector");
  const result: number[] = [];
  for (let offset = 0; offset < vector.length; offset += 2) {
    const pair = offset / 2;
    const angle = position * base ** (-(2 * pair) / vector.length);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const first = vector[offset] ?? 0;
    const second = vector[offset + 1] ?? 0;
    result.push(first * cosine - second * sine, first * sine + second * cosine);
  }
  return result;
}
