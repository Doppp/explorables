import { describe, expect, it } from "vitest";
import { appendToken, chooseToken, nextTokenCandidates, tokenize } from "./model.ts";

describe("next-token loop", () => {
  it("tokenizes the visible prompt and returns a distribution", () => {
    expect(tokenize("  The cat ")).toEqual(["The", "cat"]);
    expect(
      nextTokenCandidates("The cat").reduce((sum, item) => sum + item.probability, 0),
    ).toBeCloseTo(1);
  });

  it("selects from the distribution and appends one token", () => {
    const candidates = nextTokenCandidates("The cat");
    expect(chooseToken(candidates, 0.1)).toBe("sat");
    expect(chooseToken(candidates, 0.8)).toBe("slept");
    expect(appendToken("The cat", "sat")).toBe("The cat sat");
    expect(appendToken("Done", ".")).toBe("Done.");
  });
});
