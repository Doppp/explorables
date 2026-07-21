import { describe, expect, it } from "vitest";
const { update } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/gradient.ts"
    : "../starter/gradient.ts"
);
describe("gradient update", () => {
  it("moves toward the minimum", () => expect(update(-4, 0.1)).toBeCloseTo(-2.6));
  it("rejects invalid rates", () => expect(() => update(0, 0)).toThrow(RangeError));
});
