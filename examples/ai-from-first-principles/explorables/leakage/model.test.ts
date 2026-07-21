import { describe, expect, it } from "vitest";
import { memoriserAccuracy, splitExamples, type Example } from "./model.ts";

const examples: Example[] = ["A", "B", "C", "D"].flatMap((family) =>
  [0, 1, 2].map((variant) => ({ family, variant })),
);
describe("evaluation leakage", () => {
  it("shows inflated accuracy under example-level splitting", () => {
    expect(memoriserAccuracy(splitExamples(examples, true))).toBeGreaterThan(
      memoriserAccuracy(splitExamples(examples, false)),
    );
    expect(memoriserAccuracy(splitExamples(examples, false))).toBe(0);
  });
});
