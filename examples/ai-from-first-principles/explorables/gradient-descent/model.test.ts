import { describe, expect, it } from "vitest";
import { classifyLossTrend, gradient, loss, step } from "./model.ts";

describe("gradient descent model", () => {
  it("has its minimum at three", () => {
    expect(loss(3)).toBe(0);
    expect(gradient(3)).toBe(0);
  });
  it("converges or diverges according to step size", () => {
    expect(Math.abs(step(-4, 0.2) - 3)).toBeLessThan(7);
    expect(Math.abs(step(-4, 1.1) - 3)).toBeGreaterThan(7);
  });
  it("distinguishes convergence, constant-distance oscillation, and divergence", () => {
    expect(classifyLossTrend(49, 10)).toBe("converging");
    expect(classifyLossTrend(49, 49)).toBe("constant-distance oscillation");
    expect(classifyLossTrend(49, 70.56)).toBe("diverging");
  });
});
