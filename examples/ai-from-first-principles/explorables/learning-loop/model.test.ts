import { describe, expect, it } from "vitest";
import { squaredLoss, trainOneStep } from "./model.ts";

describe("the introductory learning loop", () => {
  it("measures squared prediction error", () => {
    expect(squaredLoss(-1, 3)).toBe(16);
  });

  it("moves the parameter toward the target and lowers loss", () => {
    expect(trainOneStep(-1, 3)).toEqual({
      before: -1,
      prediction: -1,
      target: 3,
      error: 4,
      loss: 16,
      after: 1,
      nextLoss: 4,
    });
  });

  it("rejects invalid adjustments", () => {
    expect(() => trainOneStep(0, 1, 0)).toThrow(/greater than 0/);
    expect(() => trainOneStep(0, 1, 1.1)).toThrow(/at most 1/);
  });
});
