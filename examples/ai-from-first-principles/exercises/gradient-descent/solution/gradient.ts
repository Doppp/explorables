export function update(parameter: number, learningRate: number): number {
  if (
    !Number.isFinite(parameter) ||
    !Number.isFinite(learningRate) ||
    learningRate <= 0
  )
    throw new RangeError("invalid update");
  return parameter - learningRate * 2 * (parameter - 3);
}
