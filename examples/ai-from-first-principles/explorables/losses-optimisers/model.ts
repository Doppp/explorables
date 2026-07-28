import { linearLayer, type Matrix, type Vector } from "../linear-layers/model.ts";

export type Optimiser = "sgd" | "momentum" | "adamw";

export interface OptimiserConfig {
  kind: Optimiser;
  learningRate: number;
  clippingNorm: number;
  weightDecay: number;
  beta1?: number;
  beta2?: number;
  epsilon?: number;
}

export interface OptimiserState {
  step: number;
  firstMoment: number[];
  secondMoment: number[];
}

export interface Classifier {
  weights: Matrix;
  bias: Vector;
}

export interface ClassifierStep {
  model: Classifier;
  state: OptimiserState;
  logits: number[];
  probabilities: number[];
  loss: number;
  gradientNorm: number;
  clippedGradientNorm: number;
  updateNorm: number;
}

function assertFinite(values: number[], name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite numbers`);
  }
}

export function softmax(logits: number[]): number[] {
  if (logits.length === 0) throw new RangeError("logits must not be empty");
  assertFinite(logits, "logits");
  const maximum = Math.max(...logits);
  const exponents = logits.map((logit) => Math.exp(logit - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function naiveSoftmax(logits: number[]): number[] {
  const exponents = logits.map(Math.exp);
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function crossEntropy(logits: number[], target: number): number {
  if (!Number.isInteger(target) || target < 0 || target >= logits.length) {
    throw new RangeError(`target ${target} is outside the logits`);
  }
  assertFinite(logits, "logits");
  const maximum = Math.max(...logits);
  const shifted = logits.map((logit) => logit - maximum);
  const logSumExp = Math.log(shifted.reduce((sum, logit) => sum + Math.exp(logit), 0));
  return logSumExp - (shifted[target] ?? 0);
}

export function vectorNorm(values: number[]): number {
  assertFinite(values, "vector");
  return Math.hypot(...values);
}

export function clipByGlobalNorm(
  gradients: number[],
  maximumNorm: number,
): { values: number[]; originalNorm: number; clippedNorm: number } {
  if (!(maximumNorm > 0) || !Number.isFinite(maximumNorm)) {
    throw new RangeError("maximum norm must be positive and finite");
  }
  const originalNorm = vectorNorm(gradients);
  const scale =
    originalNorm > maximumNorm && originalNorm > 0 ? maximumNorm / originalNorm : 1;
  const values = gradients.map((gradient) => gradient * scale);
  return { values, originalNorm, clippedNorm: vectorNorm(values) };
}

export function initialOptimiserState(size: number): OptimiserState {
  if (!Number.isInteger(size) || size < 0) {
    throw new RangeError("state size must be a non-negative integer");
  }
  return {
    step: 0,
    firstMoment: Array.from({ length: size }, () => 0),
    secondMoment: Array.from({ length: size }, () => 0),
  };
}

export function optimiserStep(
  parameters: number[],
  gradients: number[],
  state: OptimiserState,
  config: OptimiserConfig,
): { parameters: number[]; state: OptimiserState; updateNorm: number } {
  if (parameters.length !== gradients.length) {
    throw new RangeError("parameters and gradients must have equal length");
  }
  if (
    state.firstMoment.length !== parameters.length ||
    state.secondMoment.length !== parameters.length
  ) {
    throw new RangeError("optimiser state does not match parameter length");
  }
  if (!(config.learningRate > 0) || !Number.isFinite(config.learningRate)) {
    throw new RangeError("learning rate must be positive and finite");
  }
  if (!(config.weightDecay >= 0) || !Number.isFinite(config.weightDecay)) {
    throw new RangeError("weight decay must be non-negative and finite");
  }
  assertFinite(parameters, "parameters");
  const clipped = clipByGlobalNorm(gradients, config.clippingNorm);
  const beta1 = config.beta1 ?? 0.9;
  const beta2 = config.beta2 ?? 0.999;
  const epsilon = config.epsilon ?? 1e-8;
  const step = state.step + 1;
  const firstMoment = clipped.values.map(
    (gradient, index) =>
      beta1 * (state.firstMoment[index] ?? 0) + (1 - beta1) * gradient,
  );
  const secondMoment = clipped.values.map(
    (gradient, index) =>
      beta2 * (state.secondMoment[index] ?? 0) + (1 - beta2) * gradient * gradient,
  );
  const direction = clipped.values.map((gradient, index) => {
    if (config.kind === "sgd") return gradient;
    if (config.kind === "momentum") return firstMoment[index] ?? 0;
    const correctedFirst = (firstMoment[index] ?? 0) / (1 - beta1 ** step);
    const correctedSecond = (secondMoment[index] ?? 0) / (1 - beta2 ** step);
    return correctedFirst / (Math.sqrt(correctedSecond) + epsilon);
  });
  const updates = parameters.map(
    (parameter, index) =>
      config.learningRate * ((direction[index] ?? 0) + config.weightDecay * parameter),
  );
  return {
    parameters: parameters.map((parameter, index) => parameter - (updates[index] ?? 0)),
    state: { step, firstMoment, secondMoment },
    updateNorm: vectorNorm(updates),
  };
}

function flatten(model: Classifier): number[] {
  return [...model.weights.flat(), ...model.bias];
}

function unflatten(parameters: number[], outputs: number, inputs: number): Classifier {
  const weights = Array.from({ length: outputs }, (_, row) =>
    parameters.slice(row * inputs, (row + 1) * inputs),
  );
  return { weights, bias: parameters.slice(outputs * inputs) };
}

export function trainClassifier(
  model: Classifier,
  input: number[],
  target: number,
  state: OptimiserState,
  config: OptimiserConfig,
): ClassifierStep {
  const logits = linearLayer(input, model.weights, model.bias);
  const probabilities = softmax(logits);
  const logitGradients = probabilities.map(
    (probability, index) => probability - (index === target ? 1 : 0),
  );
  const weightGradients = logitGradients.flatMap((gradient) =>
    input.map((value) => gradient * value),
  );
  const gradients = [...weightGradients, ...logitGradients];
  const clipped = clipByGlobalNorm(gradients, config.clippingNorm);
  const result = optimiserStep(flatten(model), gradients, state, config);
  return {
    model: unflatten(result.parameters, model.weights.length, input.length),
    state: result.state,
    logits,
    probabilities,
    loss: crossEntropy(logits, target),
    gradientNorm: clipped.originalNorm,
    clippedGradientNorm: clipped.clippedNorm,
    updateNorm: result.updateNorm,
  };
}
