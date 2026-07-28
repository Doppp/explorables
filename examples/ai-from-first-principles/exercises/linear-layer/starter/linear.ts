export function linearLayer(
  input: number[],
  weights: number[][],
  bias: number[],
): number[] {
  const columns = weights[0]?.length ?? 0;
  return Array.from({ length: columns }, (_, column) => {
    const value = weights.reduce(
      (sum, row, index) => sum + (row[column] ?? 0) * (input[index] ?? 0),
      0,
    );
    return value + (bias[column] ?? 0);
  });
}
