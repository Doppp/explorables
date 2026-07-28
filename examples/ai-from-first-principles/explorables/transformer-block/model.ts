import { linearLayer, type Matrix, type Vector } from "../linear-layers/model.ts";

export interface TransformerBlockParameters {
  firstNormScale: Vector;
  secondNormScale: Vector;
  attentionWeights: Matrix;
  gateWeights: Matrix;
  valueWeights: Matrix;
  downWeights: Matrix;
}

export interface TransformerBlockTrace {
  input: Vector;
  firstNormalised: Vector;
  attentionDelta: Vector;
  afterAttention: Vector;
  secondNormalised: Vector;
  mlpGate: Vector;
  mlpValue: Vector;
  mlpHidden: Vector;
  mlpDelta: Vector;
  output: Vector;
}

function assertFinite(values: Vector, name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite numbers`);
  }
}

function zeros(length: number): Vector {
  return Array.from({ length }, () => 0);
}

export function add(left: Vector, right: Vector): Vector {
  if (left.length !== right.length) {
    throw new RangeError("residual addition needs equal vector widths");
  }
  assertFinite(left, "left residual");
  assertFinite(right, "right residual");
  return left.map((value, index) => value + (right[index] ?? 0));
}

export function rmsNorm(input: Vector, scale: Vector, epsilon = 1e-5): Vector {
  if (input.length === 0 || input.length !== scale.length) {
    throw new RangeError("RMSNorm input and scale need equal positive widths");
  }
  if (!(epsilon > 0) || !Number.isFinite(epsilon)) {
    throw new RangeError("RMSNorm epsilon must be positive and finite");
  }
  assertFinite(input, "RMSNorm input");
  assertFinite(scale, "RMSNorm scale");
  const meanSquare =
    input.reduce((sum, value) => sum + value * value, 0) / input.length;
  const inverseRootMeanSquare = 1 / Math.sqrt(meanSquare + epsilon);
  return input.map(
    (value, index) => value * inverseRootMeanSquare * (scale[index] ?? 0),
  );
}

export function silu(value: number): number {
  return value / (1 + Math.exp(-value));
}

export function transformerBlock(
  input: Vector,
  parameters: TransformerBlockParameters,
  brokenReplaceResidual = false,
): TransformerBlockTrace {
  const firstNormalised = rmsNorm(input, parameters.firstNormScale);
  const attentionDelta = linearLayer(
    firstNormalised,
    parameters.attentionWeights,
    zeros(input.length),
  );
  const afterAttention = brokenReplaceResidual
    ? attentionDelta
    : add(input, attentionDelta);
  const secondNormalised = rmsNorm(afterAttention, parameters.secondNormScale);
  const mlpGate = linearLayer(
    secondNormalised,
    parameters.gateWeights,
    zeros(parameters.gateWeights.length),
  );
  const mlpValue = linearLayer(
    secondNormalised,
    parameters.valueWeights,
    zeros(parameters.valueWeights.length),
  );
  const mlpHidden = mlpGate.map((gate, index) => silu(gate) * (mlpValue[index] ?? 0));
  const mlpDelta = linearLayer(mlpHidden, parameters.downWeights, zeros(input.length));
  const output = brokenReplaceResidual ? mlpDelta : add(afterAttention, mlpDelta);
  return {
    input: [...input],
    firstNormalised,
    attentionDelta,
    afterAttention,
    secondNormalised,
    mlpGate,
    mlpValue,
    mlpHidden,
    mlpDelta,
    output,
  };
}
