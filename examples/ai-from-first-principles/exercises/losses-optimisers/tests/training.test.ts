import { describe, expect, it } from "vitest";

const { stableSoftmax, crossEntropy, clipByGlobalNorm, momentumStep } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/training.ts"
    : "../starter/training.ts"
);

describe("stable loss and momentum", () => {
  it("normalises large logits without overflow", () => {
    expect(stableSoftmax([1000, 1000])).toEqual([0.5, 0.5]);
    expect(crossEntropy([1000, 1000], 0)).toBeCloseTo(Math.log(2));
  });

  it("preserves loss under a shared logit offset", () => {
    expect(crossEntropy([2, 1, -1], 1)).toBeCloseTo(crossEntropy([1002, 1001, 999], 1));
  });

  it("keeps loss finite when the target probability underflows", () => {
    expect(crossEntropy([0, -1000], 1)).toBeCloseTo(1000);
  });

  it("clips the global norm without changing direction", () => {
    expect(clipByGlobalNorm([3, 4], 2.5)).toEqual([1.5, 2]);
  });

  it("retains velocity and applies decoupled weight decay", () => {
    const first = momentumStep([2], [1], [0], 0.1, 0.5, 0.2);
    expect(first.velocity).toEqual([0.5]);
    expect(first.parameters[0]).toBeCloseTo(1.91);
    const second = momentumStep(first.parameters, [1], first.velocity, 0.1, 0.5, 0.2);
    expect(second.velocity).toEqual([0.75]);
    expect(second.parameters[0]).toBeCloseTo(1.7968);
  });

  it("rejects invalid targets and hyperparameters", () => {
    expect(() => crossEntropy([1, 2], 2)).toThrow(/target/i);
    expect(() => crossEntropy([1, Number.NaN], 0)).toThrow(/finite/i);
    expect(() => clipByGlobalNorm([1], 0)).toThrow(/norm/i);
    expect(() => momentumStep([1], [1], [0], 0, 0.9, 0)).toThrow(/learning rate/i);
  });
});
