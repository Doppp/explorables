import {
  compareModelDescriptors,
  parseModelAtlasDescriptor,
} from "@explorables/model-atlas";
import { describe, expect, it } from "vitest";
import { forward, initialTinyTransformer } from "../tiny-transformer/model.ts";
import gpt2 from "./gpt-2-small.json";
import { createTinyAtlasTrace } from "./model.ts";
import tiny from "./tiny-transformer.json";

describe("tiny Transformer atlas trace", () => {
  it("maps every displayed tensor to the executable forward pass", () => {
    const model = initialTinyTransformer();
    const tokenIds = [0, 1, 2];
    const atlas = createTinyAtlasTrace(model, tokenIds);
    const final = forward(model, tokenIds).tokens.at(-1);
    expect(final).toBeDefined();
    if (!final) throw new Error("expected a final token trace");
    const embedding = model.embeddings[final.token] ?? [];
    const residual = embedding.map(
      (value, index) => value + (final.attentionOutput[index] ?? 0),
    );

    expect(atlas.steps.map((step) => step.stageId)).toEqual([
      "tokens",
      "embedding",
      "attention",
      "residual",
      "normalisation",
      "lm-head",
    ]);
    expect(atlas.steps[2]).toMatchObject({
      values: [final.attentionWeights],
      rowLabels: ["weights"],
      columnLabels: ["position 0", "position 1", "position 2"],
    });
    expect(atlas.steps[3]).toMatchObject({
      values: [final.attentionOutput, residual],
      rowLabels: ["attention output", "embedding + attention output"],
      columnLabels: ["d0", "d1", "d2"],
    });
    expect(atlas.steps[4]?.values).toEqual([final.hidden]);
    expect(atlas.steps[5]?.values).toEqual([final.logits]);
  });

  it("compares the executable model with the pinned GPT-2 configuration", () => {
    const tinyDescriptor = parseModelAtlasDescriptor(tiny);
    const gpt2Descriptor = parseModelAtlasDescriptor(gpt2);
    const comparison = compareModelDescriptors(tinyDescriptor, gpt2Descriptor);

    expect(comparison.find((row) => row.key === "attention-blocks")).toMatchObject({
      left: "1",
      right: "12",
      relation: "different",
    });
    expect(gpt2Descriptor.sources[0]?.reference).toContain(
      "9b63575ef42771a015060c964af2c3da4cf7c8ab",
    );
  });
});
