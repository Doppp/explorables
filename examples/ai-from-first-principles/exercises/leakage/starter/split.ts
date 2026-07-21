export interface Example {
  family: string;
  variant: number;
}
export function groupedSplit(examples: Example[], _testFamilies: Set<string>) {
  return examples.map((example, index) => ({
    ...example,
    split: index % 2 ? "test" : "train",
  }));
}
