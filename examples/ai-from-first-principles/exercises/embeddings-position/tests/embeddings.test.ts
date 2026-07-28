import { describe, expect, it } from "vitest";

const { embeddingLookup, rotatePairs } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/embeddings.ts"
    : "../starter/embeddings.ts"
);

describe("embedding lookup and pair rotation", () => {
  it("looks up rows without aliasing the table", () => {
    const table = [
      [1, 0],
      [0, 1],
    ];
    const result = embeddingLookup(table, [1, 0]);
    expect(result).toEqual([
      [0, 1],
      [1, 0],
    ]);
    result[0]?.splice(0, 1, 9);
    expect(table[1]).toEqual([0, 1]);
  });

  it("leaves position zero unchanged", () => {
    expect(rotatePairs([1, 2, 3, 4], 0)).toEqual([1, 2, 3, 4]);
  });

  it("preserves norm while changing direction", () => {
    const vector = [1, 2, -0.5, 0.25];
    const rotated = rotatePairs(vector, 7);
    expect(rotated).not.toEqual(vector);
    expect(Math.hypot(...rotated)).toBeCloseTo(Math.hypot(...vector));
  });

  it("validates identifiers and even vector width", () => {
    expect(() => embeddingLookup([[1, 0]], [1])).toThrow(/outside/i);
    expect(() => rotatePairs([1, 2, 3], 1)).toThrow(/even/i);
  });
});
