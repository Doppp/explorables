export function maskedSoftmax(scores: number[], row: number): number[] {
  const masked = scores.map((value, column) =>
    column > row ? Number.NEGATIVE_INFINITY : value,
  );
  const maximum = Math.max(...masked);
  const values = masked.map((value) => Math.exp(value - maximum));
  const total = values.reduce((a, b) => a + b, 0);
  return values.map((value) => value / total);
}
