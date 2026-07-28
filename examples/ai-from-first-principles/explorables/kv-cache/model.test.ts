import { describe, expect, it } from "vitest";
import {
  appendCache,
  attend,
  decodeWithCache,
  decodeWithoutCache,
  maximumOutputDifference,
} from "./model.ts";

const sequence = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 1],
];

describe("KV-cache decoding", () => {
  it("reuses keys and values without changing causal outputs", () => {
    const uncached = decodeWithoutCache(sequence, 2);
    const cached = decodeWithCache(sequence, 2);
    expect(maximumOutputDifference(uncached, cached)).toBeCloseTo(0, 12);
    expect(cached.totalProjectionWork).toBeLessThan(uncached.totalProjectionWork);
  });

  it("grows by one key and value per token without mutating prior state", () => {
    const first = appendCache({ keys: [], values: [] }, [1, 0], [0, 1]);
    const second = appendCache(first, [2, 0], [0, 2]);
    expect(first.keys).toEqual([[1, 0]]);
    expect(second.keys).toEqual([
      [1, 0],
      [2, 0],
    ]);
    expect(second.values).toHaveLength(2);
  });

  it("exposes the output error caused by dropping cache history", () => {
    const uncached = decodeWithoutCache(sequence, 2);
    const broken = decodeWithCache(sequence, 2, true);
    expect(maximumOutputDifference(uncached, broken)).toBeGreaterThan(0.1);
    expect(broken.steps.at(-1)?.cacheTokens).toBe(1);
  });

  it("validates cache and attention shapes", () => {
    expect(() => attend([1, 0], [[1]], [[1]])).toThrow(/2 finite/);
    expect(() => appendCache({ keys: [[1, 0]], values: [] }, [0, 1], [0, 1])).toThrow(
      /equal lengths/,
    );
  });
});
