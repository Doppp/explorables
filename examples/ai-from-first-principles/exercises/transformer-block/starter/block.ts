export function rmsNorm(input: number[], scale: number[], epsilon = 1e-5): number[] {
  const mean = input.reduce((sum, value) => sum + value, 0) / input.length;
  const variance =
    input.reduce((sum, value) => sum + (value - mean) ** 2, 0) / input.length;
  return input.map(
    (value, index) =>
      ((value - mean) / Math.sqrt(variance + epsilon)) * (scale[index] ?? 1),
  );
}

export function residualSublayer(
  input: number[],
  scale: number[],
  transform: (normalised: number[]) => number[],
): number[] {
  return transform(rmsNorm(input, scale));
}
