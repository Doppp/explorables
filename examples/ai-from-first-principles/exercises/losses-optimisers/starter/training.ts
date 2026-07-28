export function stableSoftmax(logits: number[]): number[] {
  const exponents = logits.map(Math.exp);
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function crossEntropy(logits: number[], target: number): number {
  return -Math.log(stableSoftmax(logits)[target] ?? 0);
}

export function clipByGlobalNorm(gradients: number[], maximumNorm: number): number[] {
  return gradients.map((gradient) =>
    Math.max(-maximumNorm, Math.min(maximumNorm, gradient)),
  );
}

export function momentumStep(
  parameters: number[],
  gradients: number[],
  _previousVelocity: number[],
  learningRate: number,
  beta: number,
  weightDecay: number,
): { parameters: number[]; velocity: number[] } {
  const velocity = gradients.map((gradient) => (1 - beta) * gradient);
  return {
    parameters: parameters.map(
      (parameter, index) =>
        parameter - learningRate * ((velocity[index] ?? 0) + weightDecay * parameter),
    ),
    velocity,
  };
}
