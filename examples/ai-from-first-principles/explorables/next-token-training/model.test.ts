import { describe, expect, it } from "vitest";
import { meanTransitionLoss, nextTokenPairs, trainTransitionModel } from "./model.ts";

const identityBiased = [
  [2, 0, 0],
  [0, 2, 0],
  [0, 0, 2],
];

describe("next-token training model", () => {
  it("shifts targets one position to the left", () => {
    expect(nextTokenPairs([0, 1, 2, 1], 3)).toEqual([
      { position: 0, input: 0, target: 1 },
      { position: 1, input: 1, target: 2 },
      { position: 2, input: 2, target: 1 },
    ]);
  });

  it("exposes the flattering unshifted-target bug", () => {
    const sequence = [0, 1, 2, 1];
    expect(meanTransitionLoss(identityBiased, sequence, true)).toBeLessThan(
      meanTransitionLoss(identityBiased, sequence),
    );
  });

  it("reduces the correctly shifted objective", () => {
    const sequence = [0, 1, 0, 2];
    let weights = identityBiased;
    const initial = meanTransitionLoss(weights, sequence);
    for (let step = 0; step < 30; step += 1) {
      weights = trainTransitionModel(weights, sequence, 0.5).weights;
    }
    expect(meanTransitionLoss(weights, sequence)).toBeLessThan(initial);
  });

  it("rejects invalid sequences and learning rates", () => {
    expect(() => nextTokenPairs([0], 3)).toThrow("at least two");
    expect(() => nextTokenPairs([0, 3], 3)).toThrow("outside");
    expect(() => trainTransitionModel(identityBiased, [0, 1], 0)).toThrow(
      "learning rate",
    );
  });
});
