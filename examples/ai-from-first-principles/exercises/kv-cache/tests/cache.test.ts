import { describe, expect, it } from "vitest";

const { appendCache, cachedAttention } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/cache.ts"
    : "../starter/cache.ts"
);

describe("incremental KV cache", () => {
  it("appends without mutating or dropping the prompt", () => {
    const first = appendCache({ keys: [], values: [] }, [1, 0], [2, 0]);
    const second = appendCache(first, [0, 1], [0, 4]);
    expect(first).toEqual({ keys: [[1, 0]], values: [[2, 0]] });
    expect(second).toEqual({
      keys: [
        [1, 0],
        [0, 1],
      ],
      values: [
        [2, 0],
        [0, 4],
      ],
    });
  });

  it("mixes every cached value with scaled attention weights", () => {
    const cache = {
      keys: [
        [1, 0],
        [0, 1],
      ],
      values: [
        [2, 0],
        [0, 4],
      ],
    };
    const output = cachedAttention([1, 0], cache);
    expect(output[0]).toBeGreaterThan(1);
    expect(output[1]).toBeGreaterThan(0);
    expect(output[0]).toBeLessThan(2);
    expect(output[1]).toBeLessThan(2);
  });

  it("uses stable softmax for large scores", () => {
    const output = cachedAttention([1000, 0], {
      keys: [
        [1000, 0],
        [999, 0],
      ],
      values: [
        [1, 0],
        [0, 1],
      ],
    });
    expect(output.every(Number.isFinite)).toBe(true);
    expect(output[0]).toBeCloseTo(1);
  });

  it("rejects mismatched cache shapes", () => {
    expect(() => cachedAttention([1, 0], { keys: [[1]], values: [[1]] })).toThrow(
      /2 finite/,
    );
  });
});
