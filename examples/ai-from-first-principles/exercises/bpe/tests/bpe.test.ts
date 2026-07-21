import { describe, expect, it } from "vitest";
const api = await import(
  process.env.EXPLORABLES_SOLUTION === "1" ? "../solution/bpe.ts" : "../starter/bpe.ts"
);
describe("BPE operations", () => {
  it("counts repeated occurrences", () =>
    expect(api.countPairs([["a", "a", "a", "</w>"]]).get("a a")).toBe(2));
  it("merges throughout the corpus", () =>
    expect(
      api.merge(
        [
          ["l", "o", "w"],
          ["l", "o", "w"],
        ],
        ["l", "o"],
      ),
    ).toEqual([
      ["lo", "w"],
      ["lo", "w"],
    ]));
});
