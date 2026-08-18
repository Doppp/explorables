import type { ModelAtlasTrace } from "@explorables/model-atlas";
import type { Matrix, Vector } from "../linear-layers/model.ts";
import {
  forward,
  type TinyTransformer,
  vocabulary,
} from "../tiny-transformer/model.ts";

interface TraceStep {
  stageId: string;
  values: Matrix;
  rowLabels: string[];
  columnLabels: string[];
}

function vectorStep(stageId: string, values: Vector): TraceStep {
  return {
    stageId,
    values: [values],
    rowLabels: ["final position"],
    columnLabels: values.map((_, index) => `d${index}`),
  };
}

export function createTinyAtlasTrace(
  model: TinyTransformer,
  tokenIds: number[],
): ModelAtlasTrace {
  const final = forward(model, tokenIds).tokens.at(-1);
  if (!final) throw new RangeError("the atlas trace needs at least one token");
  const embedding = [...(model.embeddings[final.token] ?? [])];
  const residual = embedding.map(
    (value, index) => value + (final.attentionOutput[index] ?? 0),
  );

  return {
    descriptorId: "tiny-transformer",
    traceId: "fixed-forward-pass",
    tokens: tokenIds.map((token) => vocabulary[token] ?? `token ${token}`),
    steps: [
      {
        stageId: "tokens",
        values: [tokenIds],
        rowLabels: ["prompt"],
        columnLabels: tokenIds.map((_, index) => `position ${index}`),
      },
      vectorStep("embedding", embedding),
      {
        stageId: "attention",
        values: [final.attentionWeights, final.attentionOutput],
        rowLabels: ["weights", "weighted value"],
        columnLabels: final.attentionWeights.map((_, index) => `position ${index}`),
      },
      vectorStep("residual", residual),
      vectorStep("normalisation", final.hidden),
      vectorStep("lm-head", final.logits),
    ],
  };
}
