import { describe, expect, it } from "vitest";

const { nucleus } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/sampling.ts"
    : "../starter/sampling.ts"
);
describe("nucleus distribution", () => {
  it("keeps the highest probability independent of vocabulary order", () =>
    expect(nucleus([0, 5, 1], 1, 0.7)).toEqual([0, 1, 0]));
  it("returns a normalised distribution", () =>
    expect(
      nucleus([2, 1, 0], 1, 0.9).reduce((a: number, b: number) => a + b, 0),
    ).toBeCloseTo(1));
  it("stably scales large logits at a non-unit temperature", () => {
    const distribution = nucleus([2000, 1998], 2, 1);
    expect(distribution.every(Number.isFinite)).toBe(true);
    expect(distribution[0] ?? Number.NaN).toBeCloseTo(0.7310586);
    expect(distribution[1] ?? Number.NaN).toBeCloseTo(0.2689414);
  });
});
