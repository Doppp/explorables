import { describe, expect, it } from "vitest";
import { combineHeads, multiHeadAttention, splitHeads } from "./model.ts";

const identity = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

const sequence = [
  [1, 0, 0, 1],
  [0.8, 0.2, 1, 0],
  [0, 1, 0.5, 0.5],
];

describe("multi-head attention model", () => {
  it("splits and combines without reordering features", () => {
    const vector = [1, 2, 3, 4];
    expect(splitHeads(vector, 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(combineHeads(splitHeads(vector, 2))).toEqual(vector);
  });

  it("produces one causal distribution per head and token", () => {
    const result = multiHeadAttention(
      sequence,
      {
        queryWeights: identity,
        keyWeights: identity,
        valueWeights: identity,
        outputWeights: identity,
      },
      2,
    );
    expect(result.heads).toHaveLength(2);
    expect(result.heads[0]?.weights[0]).toEqual([1, 0, 0]);
    expect(result.heads[1]?.weights[1]?.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(result.output).toHaveLength(3);
    expect(result.output[0]).toHaveLength(4);
    expect(result.heads[0]?.weights).not.toEqual(result.heads[1]?.weights);
  });

  it("exposes the broken shared-head failure", () => {
    const result = multiHeadAttention(
      sequence,
      {
        queryWeights: identity,
        keyWeights: identity,
        valueWeights: identity,
        outputWeights: identity,
      },
      2,
      true,
      true,
    );
    expect(result.heads[0]).toEqual(result.heads[1]);
  });

  it("rejects a head count that does not divide the model width", () => {
    expect(() => splitHeads([1, 2, 3, 4], 3)).toThrow("divide evenly");
  });
});
