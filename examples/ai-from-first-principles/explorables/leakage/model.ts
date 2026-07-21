export interface Example {
  family: string;
  variant: number;
}
export interface SplitRow extends Example {
  split: "train" | "test";
  seen: boolean;
}

export function splitExamples(examples: Example[], leaky: boolean): SplitRow[] {
  const trainFamilies = new Set<string>();
  const assigned = examples.map((example, index) => ({
    ...example,
    split: (leaky ? index % 2 === 0 : example.family < "C")
      ? ("train" as const)
      : ("test" as const),
  }));
  for (const row of assigned) if (row.split === "train") trainFamilies.add(row.family);
  return assigned.map((row) => ({
    ...row,
    seen: row.split === "test" && trainFamilies.has(row.family),
  }));
}

export function memoriserAccuracy(rows: SplitRow[]): number {
  const test = rows.filter((row) => row.split === "test");
  return test.length === 0 ? 0 : test.filter((row) => row.seen).length / test.length;
}
