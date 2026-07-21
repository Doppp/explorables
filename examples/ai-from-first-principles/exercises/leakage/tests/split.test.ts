import { describe, expect, it } from "vitest";
const { groupedSplit } = await import(
  process.env.EXPLORABLES_SOLUTION === "1"
    ? "../solution/split.ts"
    : "../starter/split.ts"
);
describe("grouped split", () => {
  it("keeps every family intact", () => {
    const rows = groupedSplit(
      [
        { family: "A", variant: 1 },
        { family: "A", variant: 2 },
        { family: "B", variant: 1 },
        { family: "B", variant: 2 },
      ],
      new Set(["B"]),
    );
    expect(rows.map((row: { split: string }) => row.split)).toEqual([
      "train",
      "train",
      "test",
      "test",
    ]);
  });
  it("preserves input order", () =>
    expect(
      groupedSplit(
        [
          { family: "C", variant: 2 },
          { family: "A", variant: 1 },
        ],
        new Set(["C"]),
      ).map((row: { family: string }) => row.family),
    ).toEqual(["C", "A"]));
});
