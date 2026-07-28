import { describe, expect, it } from "vitest";

const { splitHeads, combineHeads, multiHeadAttention } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/attention.ts"
    : "../starter/attention.ts"
);

const sequence = [
  [1, 0, 0, 1],
  [0.8, 0.2, 1, 0],
  [0, 1, 0.5, 0.5],
];

describe("causal multi-head attention", () => {
  it("splits contiguous features and restores their order", () => {
    const heads = splitHeads([1, 2, 3, 4], 2);
    expect(heads).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(combineHeads(heads)).toEqual([1, 2, 3, 4]);
  });

  it("normalises the visible prefix in every head", () => {
    const result = multiHeadAttention(sequence, sequence, sequence, 2, true);
    expect(result.weights).toHaveLength(2);
    for (const head of result.weights) {
      expect(head[0]).toEqual([1, 0, 0]);
      expect(
        head[1]?.reduce((sum: number, value: number) => sum + value, 0),
      ).toBeCloseTo(1);
      expect(head[1]?.[2]).toBe(0);
    }
  });

  it("returns one model-width output per token", () => {
    const result = multiHeadAttention(sequence, sequence, sequence, 2, true);
    expect(result.output).toHaveLength(3);
    result.output.forEach((vector: number[]) => {
      expect(vector).toHaveLength(4);
    });
  });

  it("rejects incompatible head counts", () => {
    expect(() => splitHeads([1, 2, 3, 4], 3)).toThrow(/divide evenly/i);
  });
});
