import type { ModelAtlasDescriptor } from "./schema.ts";

export interface AtlasComparisonRow {
  key: string;
  label: string;
  left: string;
  right: string;
  relation: "same" | "different" | "undisclosed";
}

function dimension(descriptor: ModelAtlasDescriptor, key: string): number | undefined {
  return descriptor.stages
    .map((stage) => stage.dimensions?.[key])
    .find((value) => value !== undefined);
}

function count(
  descriptor: ModelAtlasDescriptor,
  kind: ModelAtlasDescriptor["stages"][number]["kind"],
): number | undefined {
  const stages = descriptor.stages.filter((stage) => stage.kind === kind);
  if (stages.length === 0) return undefined;
  let total = 0;
  for (const stage of stages) {
    if (stage.count === undefined) return undefined;
    total += stage.count;
  }
  return total;
}

function display(value: number | undefined): string {
  return value === undefined ? "Not disclosed here" : value.toLocaleString("en-US");
}

export function compareModelDescriptors(
  left: ModelAtlasDescriptor,
  right: ModelAtlasDescriptor,
): AtlasComparisonRow[] {
  const fields: Array<{
    key: string;
    label: string;
    read(descriptor: ModelAtlasDescriptor): number | undefined;
  }> = [
    {
      key: "attention-blocks",
      label: "Attention blocks",
      read: (value) => count(value, "attention"),
    },
    {
      key: "feed-forward-blocks",
      label: "Feed-forward blocks",
      read: (value) => count(value, "feed-forward"),
    },
    {
      key: "experts",
      label: "Expert modules",
      read: (value) => count(value, "experts"),
    },
    { key: "width", label: "Hidden width", read: (value) => dimension(value, "width") },
    {
      key: "heads",
      label: "Attention heads per block",
      read: (value) => dimension(value, "heads"),
    },
    {
      key: "context",
      label: "Context positions",
      read: (value) => dimension(value, "context"),
    },
    {
      key: "vocabulary",
      label: "Vocabulary entries",
      read: (value) => dimension(value, "vocabulary"),
    },
    {
      key: "parameters-millions",
      label: "Published parameters (millions)",
      read: (value) => dimension(value, "parameters-millions"),
    },
  ];
  return fields.map((field) => {
    const leftValue = field.read(left);
    const rightValue = field.read(right);
    return {
      key: field.key,
      label: field.label,
      left: display(leftValue),
      right: display(rightValue),
      relation:
        leftValue === undefined || rightValue === undefined
          ? "undisclosed"
          : leftValue === rightValue
            ? "same"
            : "different",
    };
  });
}
