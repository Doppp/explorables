import { describe, expect, it } from "vitest";
import { cosineSimilarity, embeddingLookup, rotatePairs } from "./model.ts";

describe("embeddings and position model", () => {
  it("looks up independent copies of embedding rows", () => {
    const table = [
      [1, 0],
      [0, 1],
    ];
    const result = embeddingLookup(table, [1, 0, 1]);
    expect(result).toEqual([
      [0, 1],
      [1, 0],
      [0, 1],
    ]);
    result[0]?.splice(0, 1, 9);
    expect(table[1]).toEqual([0, 1]);
  });

  it("measures vector similarity", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("preserves norm while encoding position", () => {
    const vector = [1, 2, -0.5, 0.25];
    expect(rotatePairs(vector, 0)).toEqual(vector);
    expect(Math.hypot(...rotatePairs(vector, 7))).toBeCloseTo(Math.hypot(...vector));
    expect(rotatePairs(vector, 1)).not.toEqual(rotatePairs(vector, 2));
  });

  it("rejects invalid identifiers and rotation shapes", () => {
    expect(() => embeddingLookup([[1, 0]], [1])).toThrow("outside");
    expect(() => rotatePairs([1, 2, 3], 1)).toThrow("even-width");
  });
});
