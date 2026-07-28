export function rmsNorm(input: number[], scale: number[], epsilon = 1e-5): number[] {
  if (input.length === 0 || input.length !== scale.length) {
    throw new RangeError("input and scale need equal positive widths");
  }
  if (!(epsilon > 0) || !Number.isFinite(epsilon)) {
    throw new RangeError("epsilon must be positive and finite");
  }
  if (
    input.some((value) => !Number.isFinite(value)) ||
    scale.some((value) => !Number.isFinite(value))
  ) {
    throw new RangeError("input and scale must be finite");
  }
  const meanSquare =
    input.reduce((sum, value) => sum + value * value, 0) / input.length;
  const inverseRootMeanSquare = 1 / Math.sqrt(meanSquare + epsilon);
  return input.map(
    (value, index) => value * inverseRootMeanSquare * (scale[index] ?? Number.NaN),
  );
}

export function residualSublayer(
  input: number[],
  scale: number[],
  transform: (normalised: number[]) => number[],
): number[] {
  const update = transform(rmsNorm(input, scale));
  if (update.length !== input.length) {
    throw new RangeError("sublayer update must match the residual width");
  }
  return input.map((value, index) => value + (update[index] ?? Number.NaN));
}
