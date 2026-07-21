import { describe, expect, it } from "vitest";
const { differentiate } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/graph.ts"
    : "../starter/graph.ts"
);
describe("graph gradients", () => {
  it("applies every chain-rule factor", () =>
    expect(differentiate(2, -1, 3)).toEqual({ y: 1, dx: -2, dw: 4, db: 2 }));
  it("handles a negative upstream slope", () =>
    expect(differentiate(3, 1, -5).dw).toBe(-12));
});
