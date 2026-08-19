import { describe, expect, it } from "vitest";
import { compareModelDescriptors } from "./compare.ts";
import { parseModelAtlasDescriptor } from "./schema.ts";

const descriptor = (id: string, width?: number, discloseCount = true) =>
  parseModelAtlasDescriptor({
    kind: "model-atlas",
    schemaVersion: 1,
    id,
    name: id,
    version: "v1",
    summary: "Comparison fixture.",
    sources: [
      {
        id: "source",
        label: "Source",
        reference: "source.md",
        evidence: "configuration-derived",
      },
    ],
    stages: [
      {
        id: "attention",
        title: "Attention",
        summary: "Repeated attention.",
        kind: "attention",
        evidence: "configuration-derived",
        sourceIds: ["source"],
        ...(discloseCount ? { count: 12 } : {}),
        ...(width ? { dimensions: { width, heads: 12 } } : {}),
      },
    ],
  });

describe("model descriptor comparison", () => {
  it("distinguishes disclosed differences from missing claims", () => {
    const rows = compareModelDescriptors(descriptor("left", 768), descriptor("right"));
    expect(rows.find((row) => row.key === "attention-blocks")?.relation).toBe("same");
    expect(rows.find((row) => row.key === "width")).toMatchObject({
      left: "768",
      right: "Not disclosed here",
      relation: "undisclosed",
    });
  });

  it("keeps an omitted stage count undisclosed", () => {
    const rows = compareModelDescriptors(
      descriptor("published", 768),
      descriptor("omitted", 768, false),
    );

    expect(rows.find((row) => row.key === "attention-blocks")).toMatchObject({
      left: "12",
      right: "Not disclosed here",
      relation: "undisclosed",
    });
  });
});
