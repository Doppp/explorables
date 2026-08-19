import { describe, expect, it } from "vitest";

const { nextTokenPairs, meanLoss, trainStep } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/training.ts"
    : "../starter/training.ts"
);

const identityBiased = [
  [2, 0, 0],
  [0, 2, 0],
  [0, 0, 2],
];

describe("shifted next-token training", () => {
  it("aligns each input with the following token", () => {
    expect(nextTokenPairs([0, 1, 2, 1])).toEqual([
      { input: 0, target: 1 },
      { input: 1, target: 2 },
      { input: 2, target: 1 },
    ]);
  });

  it("computes a finite loss for large logits", () => {
    expect(
      meanLoss(
        [
          [1000, 999],
          [999, 1000],
        ],
        [0, 1],
      ),
    ).toBeCloseTo(1.3132617);
  });

  it("keeps cross-entropy finite when the target softmax probability underflows", () => {
    expect(
      meanLoss(
        [
          [0, -1000],
          [0, 0],
        ],
        [0, 1],
      ),
    ).toBeCloseTo(1000);
  });

  it("averages accumulated gradients across all valid positions", () => {
    expect(
      trainStep(
        [
          [0, 0],
          [0, 0],
        ],
        [0, 1, 1],
        1,
      ),
    ).toEqual([
      [-0.25, 0.25],
      [-0.25, 0.25],
    ]);
  });

  it("reduces the correctly shifted objective", () => {
    const sequence = [0, 1, 0, 2];
    let weights = identityBiased;
    const initial = meanLoss(weights, sequence);
    for (let step = 0; step < 30; step += 1) {
      weights = trainStep(weights, sequence, 0.5);
    }
    expect(meanLoss(weights, sequence)).toBeLessThan(initial);
  });

  it("validates sequences and learning rates", () => {
    expect(() => nextTokenPairs([0])).toThrow(/at least two/i);
    expect(() => meanLoss(identityBiased, [0, 3])).toThrow(/outside/i);
    expect(() => trainStep(identityBiased, [0, 1], 0)).toThrow(/learning rate/i);
  });
});
