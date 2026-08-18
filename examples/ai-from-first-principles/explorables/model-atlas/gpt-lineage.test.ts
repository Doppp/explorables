import { describe, expect, it } from "vitest";
import {
  compareModelDescriptors,
  parseModelAtlasDescriptor,
} from "@explorables/model-atlas";
import gpt1 from "./gpt-1.json";
import gpt2 from "./gpt-2-small.json";
import gpt3 from "./gpt-3-175b.json";
import gpt4 from "./gpt-4-boundary.json";

const lineage = [gpt1, gpt2, gpt3, gpt4].map(parseModelAtlasDescriptor);

describe("published GPT lineage", () => {
  it("preserves published configurations for GPT-1 through GPT-3", () => {
    const [first, , third] = lineage;
    if (!first || !third) throw new Error("GPT lineage fixtures are incomplete");
    expect(
      lineage
        .slice(0, 3)
        .map(
          (descriptor) =>
            descriptor.stages.find((stage) => stage.kind === "attention")?.count,
        ),
    ).toEqual([12, 12, 96]);
    expect(
      compareModelDescriptors(first, third).find((row) => row.key === "width"),
    ).toMatchObject({ left: "768", right: "12,288", relation: "different" });
  });

  it("does not synthesize an architecture for GPT-4", () => {
    const boundary = lineage[3];
    if (!boundary) throw new Error("GPT-4 boundary fixture is missing");
    expect(boundary.stages.some((stage) => stage.kind === "undisclosed")).toBe(true);
    expect(boundary.stages.every((stage) => stage.count === undefined)).toBe(true);
    expect(boundary.stages.every((stage) => stage.dimensions === undefined)).toBe(true);
  });
});
