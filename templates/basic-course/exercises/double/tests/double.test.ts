import { describe, expect, it } from "vitest";
import { double } from "../starter/double.ts";
describe("double", () => {
  it("doubles finite values", () => expect(double(4)).toBe(8));
  it("rejects infinity", () => expect(() => double(Infinity)).toThrow(RangeError));
});
