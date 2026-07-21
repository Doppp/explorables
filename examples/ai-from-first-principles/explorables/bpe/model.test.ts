import { describe, expect, it } from "vitest";
import { bestPair, initialCorpus, mergePair, pairCounts } from "./model.ts";

describe("BPE model", () => {
  it("counts every adjacent occurrence", () => {
    const corpus = initialCorpus("low lower lowest");
    expect(pairCounts(corpus).get("l o")).toBe(3);
    expect(bestPair(corpus)).toEqual(["l", "o"]);
  });
  it("applies a learned merge throughout the corpus", () => {
    expect(
      mergePair(initialCorpus("low lower"), ["l", "o"])
        .flat()
        .filter((token) => token === "lo"),
    ).toHaveLength(2);
  });
});
