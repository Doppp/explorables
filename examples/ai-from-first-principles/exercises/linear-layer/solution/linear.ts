function assertFinite(values: number[], name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite numbers`);
  }
}

export function linearLayer(
  input: number[],
  weights: number[][],
  bias: number[],
): number[] {
  if (weights.length === 0) throw new RangeError("weights must not be empty");
  const columns = weights[0]?.length ?? 0;
  if (columns === 0 || weights.some((row) => row.length !== columns)) {
    throw new RangeError("weight rows must be non-empty and equal length");
  }
  if (input.length !== columns) {
    throw new RangeError("input length must match weight columns");
  }
  if (bias.length !== weights.length) {
    throw new RangeError("bias length must match weight rows");
  }
  assertFinite(input, "input");
  assertFinite(bias, "bias");
  weights.forEach((row) => {
    assertFinite(row, "weights");
  });
  return weights.map(
    (row, output) =>
      row.reduce(
        (sum, weight, inputIndex) => sum + weight * (input[inputIndex] ?? Number.NaN),
        0,
      ) + (bias[output] ?? Number.NaN),
  );
}
