import { describe, expect, it } from "vitest";
import { modelAtlasDescriptorSchema, modelAtlasTraceSchema } from "./schema.ts";

const descriptor = {
  kind: "model-atlas",
  schemaVersion: 1,
  id: "tiny-transformer",
  name: "Tiny Transformer",
  version: "teaching-model-v1",
  summary: "A deterministic teaching model.",
  sources: [
    {
      id: "executable-model",
      label: "Executable model",
      reference: "model.ts",
      evidence: "executable",
    },
  ],
  stages: [
    {
      id: "tokens",
      title: "Tokens",
      summary: "Input token IDs.",
      kind: "tokens",
      evidence: "executable",
      sourceIds: ["executable-model"],
    },
  ],
};

describe("model Atlas schema", () => {
  it("accepts a bounded descriptor and applies scene defaults", () => {
    const parsed = modelAtlasDescriptorSchema.parse(descriptor);
    expect(parsed.budgets.maxSceneObjects).toBe(128);
  });

  it("rejects ungrounded stages and executable-looking fields", () => {
    expect(() =>
      modelAtlasDescriptorSchema.parse({
        ...descriptor,
        stages: [{ ...descriptor.stages[0], sourceIds: ["missing"] }],
        shader: "void main() {}",
      }),
    ).toThrow();
  });

  it("rejects non-finite or oversized traces", () => {
    expect(() =>
      modelAtlasTraceSchema.parse({
        descriptorId: "tiny-transformer",
        traceId: "forward-pass",
        tokens: ["A"],
        steps: [
          {
            stageId: "tokens",
            values: [[Number.NaN]],
            rowLabels: ["prompt"],
            columnLabels: ["position-0"],
          },
        ],
      }),
    ).toThrow();
  });
});
