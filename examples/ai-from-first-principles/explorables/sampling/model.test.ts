import { describe, expect, it } from "vitest";
import { distribution, truncate } from "./model.ts";

describe("sampling model", () => {
  it("sharpens as temperature falls", () =>
    expect(distribution([2, 1], 0.2)[0]).toBeGreaterThan(
      distribution([2, 1], 2)[0] ?? 0,
    ));
  it("sorts by probability before nucleus truncation", () => {
    const result = truncate(["a", "b", "c"], [0.1, 0.7, 0.2], 3, 0.7);
    expect(result.map((entry) => entry.token)).toEqual(["b"]);
  });
});
