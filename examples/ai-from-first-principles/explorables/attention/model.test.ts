import { describe, expect, it } from "vitest";
import { attentionWeights, softmax } from "./model.ts";

describe("attention model", () => {
  it("normalises stably", () =>
    expect(softmax([1000, 1000]).reduce((a, b) => a + b, 0)).toBeCloseTo(1));
  it("masks future positions before normalisation", () => {
    const rows = attentionWeights([1, 1, 1], [1, 2, 3], true);
    expect(rows[0]).toEqual([1, 0, 0]);
    expect(rows[1]?.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
});
