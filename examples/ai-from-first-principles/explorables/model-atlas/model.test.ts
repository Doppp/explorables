import { describe, expect, it } from "vitest";
import { initialTinyTransformer } from "../tiny-transformer/model.ts";
import { createTinyAtlasTrace, finalTokenTrace } from "./model.ts";

describe("tiny Transformer atlas trace", () => {
  it("maps every displayed tensor to the executable forward pass", () => {
    const model = initialTinyTransformer();
    const tokenIds = [0, 1, 2];
    const atlas = createTinyAtlasTrace(model, tokenIds);
    const final = finalTokenTrace(model, tokenIds);

    expect(atlas.steps.map((step) => step.id)).toEqual([
      "tokens",
      "embedding",
      "attention",
      "residual",
      "normalisation",
      "lm-head",
    ]);
    expect(atlas.steps[2]?.values).toEqual([
      final.attentionWeights,
      final.attentionOutput,
    ]);
    expect(atlas.steps[4]?.values).toEqual([final.hidden]);
    expect(atlas.steps[5]?.values).toEqual([final.logits]);
    expect(atlas.steps.every((step) => step.evidence === "executable")).toBe(true);
  });
});
