import type { Matrix, Vector } from "../linear-layers/model.ts";
import {
  forward,
  type TinyTransformer,
  type TokenTrace,
  vocabulary,
} from "../tiny-transformer/model.ts";

export type AtlasEvidence = "executable" | "conceptual";

export interface AtlasStep {
  id: string;
  title: string;
  summary: string;
  evidence: AtlasEvidence;
  values: Matrix;
  rowLabels: string[];
  columnLabels: string[];
}

export interface TinyAtlasTrace {
  modelName: string;
  source: string;
  tokens: string[];
  steps: AtlasStep[];
}

function vectorRow(
  id: string,
  title: string,
  summary: string,
  values: Vector,
  evidence: AtlasEvidence = "executable",
): AtlasStep {
  return {
    id,
    title,
    summary,
    evidence,
    values: [values],
    rowLabels: ["final position"],
    columnLabels: values.map((_, index) => `d${index}`),
  };
}

export function createTinyAtlasTrace(
  model: TinyTransformer,
  tokenIds: number[],
): TinyAtlasTrace {
  const trace = forward(model, tokenIds);
  const final = trace.tokens.at(-1);
  if (!final) throw new RangeError("the atlas trace needs at least one token");
  const embedding = [...(model.embeddings[final.token] ?? [])];
  const residual = embedding.map(
    (value, index) => value + (final.attentionOutput[index] ?? 0),
  );

  return {
    modelName: "Deterministic tiny Transformer",
    source: "explorables/tiny-transformer/model.ts",
    tokens: tokenIds.map((token) => vocabulary[token] ?? `token ${token}`),
    steps: [
      {
        id: "tokens",
        title: "Token IDs",
        summary: "The fixed prompt enters as three vocabulary IDs.",
        evidence: "executable",
        values: [tokenIds],
        rowLabels: ["prompt"],
        columnLabels: tokenIds.map((_, index) => `position ${index}`),
      },
      vectorRow(
        "embedding",
        "Token embedding",
        "The final token ID selects one learned embedding row.",
        embedding,
      ),
      {
        id: "attention",
        title: "Causal attention",
        summary: "The final query mixes only its visible prefix positions.",
        evidence: "executable",
        values: [final.attentionWeights, final.attentionOutput],
        rowLabels: ["weights", "weighted value"],
        columnLabels: final.attentionWeights.map((_, index) => `position ${index}`),
      },
      vectorRow(
        "residual",
        "Residual stream",
        "Attention is added to the selected embedding instead of replacing it.",
        residual,
      ),
      vectorRow(
        "normalisation",
        "RMS normalisation",
        "RMSNorm rescales the residual stream before prediction.",
        final.hidden,
      ),
      vectorRow(
        "lm-head",
        "Language-model head",
        "The output projection produces one logit for each vocabulary token.",
        final.logits,
      ),
    ],
  };
}

export function finalTokenTrace(
  model: TinyTransformer,
  tokenIds: number[],
): TokenTrace {
  const trace = forward(model, tokenIds).tokens.at(-1);
  if (!trace) throw new RangeError("the atlas trace needs at least one token");
  return trace;
}
