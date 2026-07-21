import { describe, expect, it } from "vitest";
import { finiteDifferenceW, forwardBackward } from "./model.ts";

describe("backpropagation graph", () => {
  it("matches a numerical gradient", () => {
    const result = forwardBackward(2, -1, 3);
    expect(result.dw).toBeCloseTo(finiteDifferenceW(2, -1, 3), 5);
    expect(result).toMatchObject({ z: 1, y: 1, dw: 4 });
  });
});
