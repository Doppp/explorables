function assertFinite(values: number[], name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite numbers`);
  }
}

export function stableSoftmax(logits: number[]): number[] {
  if (logits.length === 0) throw new RangeError("logits must not be empty");
  assertFinite(logits, "logits");
  const maximum = Math.max(...logits);
  const exponents = logits.map((logit) => Math.exp(logit - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function crossEntropy(logits: number[], target: number): number {
  if (!Number.isInteger(target) || target < 0 || target >= logits.length) {
    throw new RangeError("target is outside the logits");
  }
  assertFinite(logits, "logits");
  const maximum = Math.max(...logits);
  const shifted = logits.map((logit) => logit - maximum);
  const logSumExp = Math.log(shifted.reduce((sum, logit) => sum + Math.exp(logit), 0));
  return logSumExp - (shifted[target] ?? 0);
}

export function clipByGlobalNorm(gradients: number[], maximumNorm: number): number[] {
  if (!(maximumNorm > 0) || !Number.isFinite(maximumNorm)) {
    throw new RangeError("maximum norm must be positive and finite");
  }
  assertFinite(gradients, "gradients");
  const norm = Math.hypot(...gradients);
  const scale = norm > maximumNorm && norm > 0 ? maximumNorm / norm : 1;
  return gradients.map((gradient) => gradient * scale);
}

export function momentumStep(
  parameters: number[],
  gradients: number[],
  previousVelocity: number[],
  learningRate: number,
  beta: number,
  weightDecay: number,
): { parameters: number[]; velocity: number[] } {
  if (
    parameters.length !== gradients.length ||
    parameters.length !== previousVelocity.length
  ) {
    throw new RangeError("parameters, gradients, and velocity must have equal length");
  }
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new RangeError("learning rate must be positive and finite");
  }
  if (!(beta >= 0 && beta < 1)) {
    throw new RangeError("beta must be at least zero and less than one");
  }
  if (!(weightDecay >= 0) || !Number.isFinite(weightDecay)) {
    throw new RangeError("weight decay must be non-negative and finite");
  }
  assertFinite(parameters, "parameters");
  assertFinite(gradients, "gradients");
  assertFinite(previousVelocity, "velocity");
  const velocity = gradients.map(
    (gradient, index) => beta * (previousVelocity[index] ?? 0) + (1 - beta) * gradient,
  );
  return {
    parameters: parameters.map(
      (parameter, index) =>
        parameter - learningRate * ((velocity[index] ?? 0) + weightDecay * parameter),
    ),
    velocity,
  };
}
