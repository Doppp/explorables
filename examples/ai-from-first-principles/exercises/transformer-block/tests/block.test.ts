import { describe, expect, it } from "vitest";

const { rmsNorm, residualSublayer } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/block.ts"
    : "../starter/block.ts"
);

describe("RMSNorm residual sublayer", () => {
  it("does not mean-centre a constant vector", () => {
    const result = rmsNorm([2, 2, 2, 2], [1, 1, 1, 1]);
    result.forEach((value: number) => {
      expect(value).toBeCloseTo(1);
    });
  });

  it("is approximately invariant to positive input scaling", () => {
    const first = rmsNorm([1, -2], [1, 1]);
    const second = rmsNorm([3, -6], [1, 1]);
    expect(second[0]).toBeCloseTo(first[0] ?? 0, 5);
    expect(second[1]).toBeCloseTo(first[1] ?? 0, 5);
  });

  it("preserves the residual stream when the update is zero", () => {
    const input = [1, -2, 0.5];
    expect(
      residualSublayer(input, [1, 1, 1], (normalised: number[]) =>
        normalised.map(() => 0),
      ),
    ).toEqual(input);
  });

  it("adds the update without mutating the input", () => {
    const input = [1, 2];
    expect(residualSublayer(input, [1, 1], () => [0.5, -0.5])).toEqual([1.5, 1.5]);
    expect(input).toEqual([1, 2]);
  });

  it("rejects incompatible widths", () => {
    expect(() => rmsNorm([1, 2], [1])).toThrow(/width/i);
    expect(() => residualSublayer([1, 2], [1, 1], () => [0])).toThrow(/width/i);
  });
});
