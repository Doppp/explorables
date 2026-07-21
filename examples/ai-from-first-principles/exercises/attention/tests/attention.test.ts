import { describe, expect, it } from "vitest";
const { maskedSoftmax } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/attention.ts"
    : "../starter/attention.ts"
);
describe("masked softmax", () => {
  it("normalises the visible prefix", () => {
    const row = maskedSoftmax([1, 2, 9], 1);
    expect(row[2]).toBe(0);
    expect(row.reduce((a: number, b: number) => a + b, 0)).toBeCloseTo(1);
  });
  it("is stable for large scores", () =>
    expect(maskedSoftmax([1000, 1000], 1)).toEqual([0.5, 0.5]));
});
