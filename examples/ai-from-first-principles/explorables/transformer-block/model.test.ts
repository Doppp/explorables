import { describe, expect, it } from "vitest";
import { rmsNorm, transformerBlock, type TransformerBlockParameters } from "./model.ts";

const zeroMatrix = (rows: number, columns: number) =>
  Array.from({ length: rows }, () => Array.from({ length: columns }, () => 0));

const zeroParameters: TransformerBlockParameters = {
  firstNormScale: [1, 1, 1, 1],
  secondNormScale: [1, 1, 1, 1],
  attentionWeights: zeroMatrix(4, 4),
  gateWeights: zeroMatrix(3, 4),
  valueWeights: zeroMatrix(3, 4),
  downWeights: zeroMatrix(4, 3),
};

describe("Transformer block model", () => {
  it("normalises by root mean square without mean centring", () => {
    const result = rmsNorm([1, 1, 1, 1], [1, 1, 1, 1], 1e-12);
    result.forEach((value) => {
      expect(value).toBeCloseTo(1);
    });
    const scaled = rmsNorm([2, -4], [1, 1]);
    const original = rmsNorm([1, -2], [1, 1]);
    expect(scaled[0]).toBeCloseTo(original[0] ?? 0, 5);
    expect(scaled[1]).toBeCloseTo(original[1] ?? 0, 5);
  });

  it("preserves the residual stream when both sublayers emit zero", () => {
    const input = [1, -2, 0.5, 3];
    expect(transformerBlock(input, zeroParameters).output).toEqual(input);
  });

  it("shows how replacing residuals destroys the identity path", () => {
    const input = [1, -2, 0.5, 3];
    expect(transformerBlock(input, zeroParameters, true).output).toEqual([0, 0, 0, 0]);
  });

  it("traces finite attention and SwiGLU updates", () => {
    const parameters: TransformerBlockParameters = {
      ...zeroParameters,
      attentionWeights: [
        [0.2, 0, 0, 0],
        [0, 0.2, 0, 0],
        [0, 0, 0.2, 0],
        [0, 0, 0, 0.2],
      ],
      gateWeights: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
      ],
      valueWeights: [
        [0.5, 0, 0, 0],
        [0, 0.5, 0, 0],
        [0, 0, 0.5, 0],
      ],
      downWeights: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [0.25, 0.25, 0.25],
      ],
    };
    const trace = transformerBlock([1, -1, 0.5, 0], parameters);
    expect(trace.output).toHaveLength(4);
    expect(trace.output.every(Number.isFinite)).toBe(true);
    expect(trace.mlpHidden).toHaveLength(3);
  });

  it("rejects non-finite normalisation inputs", () => {
    expect(() => rmsNorm([1, Number.NaN], [1, 1])).toThrow("finite");
  });
});
