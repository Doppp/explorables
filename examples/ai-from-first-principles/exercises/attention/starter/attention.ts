export function maskedSoftmax(scores: number[], row: number): number[] {
  const values = scores.map(Math.exp);
  const total = values.reduce((a, b) => a + b, 0);
  return values.map((value, column) => (column > row ? 0 : value / total));
}
