export interface Example {
  family: string;
  variant: number;
}
export function groupedSplit(examples: Example[], testFamilies: Set<string>) {
  return examples.map((example) => ({
    ...example,
    split: testFamilies.has(example.family) ? "test" : "train",
  }));
}
