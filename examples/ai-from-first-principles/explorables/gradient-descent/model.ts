export function loss(parameter: number): number {
  return (parameter - 3) ** 2;
}

export function gradient(parameter: number): number {
  return 2 * (parameter - 3);
}

export function step(parameter: number, learningRate: number): number {
  if (
    !Number.isFinite(parameter) ||
    !Number.isFinite(learningRate) ||
    learningRate <= 0
  ) {
    throw new RangeError("parameter and positive learning rate must be finite");
  }
  return parameter - learningRate * gradient(parameter);
}

export function classifyLossTrend(
  initialLoss: number,
  finalLoss: number,
): "converging" | "constant-distance oscillation" | "diverging" {
  const tolerance = Number.EPSILON * Math.max(1, initialLoss, finalLoss) * 16;
  if (finalLoss < initialLoss - tolerance) return "converging";
  if (finalLoss > initialLoss + tolerance) return "diverging";
  return "constant-distance oscillation";
}
