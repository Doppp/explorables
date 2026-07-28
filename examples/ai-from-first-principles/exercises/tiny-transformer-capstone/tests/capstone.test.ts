import { describe, expect, it } from "vitest";

const { shiftedExamples, causalAttentionWithResidual, outputGradient } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/capstone.ts"
    : "../starter/capstone.ts"
);

describe("tiny Transformer capstone invariants", () => {
  it("aligns each causal context with only its following token", () => {
    expect(shiftedExamples([0, 1, 2, 0])).toEqual([
      { context: [0], target: 1 },
      { context: [0, 1], target: 2 },
      { context: [0, 1, 2], target: 0 },
    ]);
  });

  it("mixes causal values and preserves the residual identity path", () => {
    const output = causalAttentionWithResidual(
      [1, 0],
      [
        [1, 0],
        [0, 1],
      ],
      [
        [0.5, 0],
        [0, 0.5],
      ],
    );
    expect(output[0]).toBeGreaterThan(1);
    expect(output[1]).toBeGreaterThan(0);
  });

  it("computes the outer-product gradient for every output token", () => {
    expect(outputGradient([2, -1], [0.2, 0.5, 0.3], 1)).toEqual([
      [0.4, -0.2],
      [-1, 0.5],
      [0.6, -0.3],
    ]);
  });

  it("rejects invalid shapes and targets", () => {
    expect(() => causalAttentionWithResidual([1, 0], [[1]], [[1]])).toThrow(/2 finite/);
    expect(() => outputGradient([1], [0.5, 0.5], 2)).toThrow(/target/);
  });
});
