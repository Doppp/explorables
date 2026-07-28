import { describe, expect, it } from "vitest";

const { linearLayer } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/linear.ts"
    : "../starter/linear.ts"
);

describe("linear layer", () => {
  it("computes one output per weight row", () => {
    expect(
      linearLayer(
        [2, -1, 0.5],
        [
          [1, 2, 0],
          [-1, 0, 4],
        ],
        [0.5, -0.5],
      ),
    ).toEqual([0.5, -0.5]);
  });

  it("supports rectangular projections", () => {
    expect(
      linearLayer(
        [1, 2],
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        [0, 0, 1],
      ),
    ).toEqual([1, 2, 4]);
  });

  it("rejects incompatible shapes", () => {
    expect(() => linearLayer([1], [[1, 2]], [0])).toThrow(/input.*weight/i);
    expect(() => linearLayer([1, 2], [[1, 2]], [0, 0])).toThrow(/bias.*weight/i);
    expect(() => linearLayer([1, 2], [[1], [2, 3]], [0, 0])).toThrow(
      /row|shape|length/i,
    );
  });

  it("rejects non-finite values and preserves inputs", () => {
    const input = [1, 2];
    const weights = [[3, 4]];
    expect(linearLayer(input, weights, [0])).toEqual([11]);
    expect(input).toEqual([1, 2]);
    expect(weights).toEqual([[3, 4]]);
    expect(() => linearLayer([1, Number.NaN], weights, [0])).toThrow(/finite/i);
  });
});
