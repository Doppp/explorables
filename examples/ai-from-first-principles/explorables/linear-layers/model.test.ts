import { describe, expect, it } from "vitest";
import { dot, linearLayer, matrixShape, transpose } from "./model.ts";

describe("linear-layer model", () => {
  it("computes a rectangular linear projection", () => {
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

  it("transposes rows and columns", () => {
    expect(
      transpose([
        [1, 2, 3],
        [4, 5, 6],
      ]),
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("rejects incompatible and ragged shapes", () => {
    expect(() => linearLayer([1], [[1, 2]], [0])).toThrow(
      "input length 1 does not match weight columns 2",
    );
    expect(() => matrixShape([[1], [2, 3]])).toThrow(
      "matrix rows must have equal length",
    );
  });

  it("rejects non-finite values", () => {
    expect(() => dot([1, Number.NaN], [1, 2])).toThrow("finite");
  });
});
