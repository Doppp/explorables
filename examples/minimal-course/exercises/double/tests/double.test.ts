import { describe, expect, it } from "vitest";
import { double } from "../starter/double.ts";

describe("double", () => {
  it("doubles positive and negative values", () => {
    expect(double(7)).toBe(14);
    expect(double(-2.5)).toBe(-5);
  });

  it("rejects the intentional non-finite failure case", () => {
    expect(() => double(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
