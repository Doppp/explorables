export type LearningStep = {
  before: number;
  prediction: number;
  target: number;
  error: number;
  loss: number;
  after: number;
  nextLoss: number;
};

export function squaredLoss(prediction: number, target: number): number {
  return (prediction - target) ** 2;
}

export function trainOneStep(
  parameter: number,
  target: number,
  adjustmentFraction = 0.5,
): LearningStep {
  if (![parameter, target, adjustmentFraction].every(Number.isFinite))
    throw new Error("The parameter, target, and adjustment must be finite numbers.");
  if (adjustmentFraction <= 0 || adjustmentFraction > 1)
    throw new Error("The adjustment fraction must be greater than 0 and at most 1.");
  const error = target - parameter;
  const after = parameter + adjustmentFraction * error;
  return {
    before: parameter,
    prediction: parameter,
    target,
    error,
    loss: squaredLoss(parameter, target),
    after,
    nextLoss: squaredLoss(after, target),
  };
}
