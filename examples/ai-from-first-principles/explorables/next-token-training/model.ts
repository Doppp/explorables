import type { Matrix } from "../linear-layers/model.ts";
import { crossEntropy, softmax } from "../losses-optimisers/model.ts";

export interface NextTokenRow {
  position: number;
  input: number;
  target: number;
  logits: number[];
  probabilities: number[];
  loss: number;
}

export interface TransitionStep {
  weights: Matrix;
  rows: NextTokenRow[];
  loss: number;
  nextLoss: number;
}

function validateWeights(weights: Matrix): number {
  if (weights.length === 0) throw new RangeError("weights must not be empty");
  const vocabularySize = weights.length;
  if (
    weights.some((row) => row.length !== vocabularySize) ||
    weights.some((row) => row.some((value) => !Number.isFinite(value)))
  ) {
    throw new RangeError("transition weights must be one finite square matrix");
  }
  return vocabularySize;
}

export function nextTokenPairs(
  tokenIds: number[],
  vocabularySize: number,
  brokenUnshifted = false,
): Array<{ position: number; input: number; target: number }> {
  if (tokenIds.length < 2) {
    throw new RangeError("next-token training needs at least two tokens");
  }
  tokenIds.forEach((tokenId) => {
    if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId >= vocabularySize) {
      throw new RangeError(`token id ${tokenId} is outside the vocabulary`);
    }
  });
  return tokenIds.slice(0, -1).map((input, position) => ({
    position,
    input,
    target: brokenUnshifted ? input : (tokenIds[position + 1] ?? 0),
  }));
}

export function transitionRows(
  weights: Matrix,
  tokenIds: number[],
  brokenUnshifted = false,
): NextTokenRow[] {
  const vocabularySize = validateWeights(weights);
  return nextTokenPairs(tokenIds, vocabularySize, brokenUnshifted).map(
    ({ position, input, target }) => {
      const logits = [...(weights[input] ?? [])];
      return {
        position,
        input,
        target,
        logits,
        probabilities: softmax(logits),
        loss: crossEntropy(logits, target),
      };
    },
  );
}

export function meanTransitionLoss(
  weights: Matrix,
  tokenIds: number[],
  brokenUnshifted = false,
): number {
  const rows = transitionRows(weights, tokenIds, brokenUnshifted);
  return rows.reduce((sum, row) => sum + row.loss, 0) / rows.length;
}

export function trainTransitionModel(
  weights: Matrix,
  tokenIds: number[],
  learningRate: number,
  brokenUnshifted = false,
): TransitionStep {
  const vocabularySize = validateWeights(weights);
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new RangeError("learning rate must be positive and finite");
  }
  const rows = transitionRows(weights, tokenIds, brokenUnshifted);
  const gradients = Array.from({ length: vocabularySize }, () =>
    Array.from({ length: vocabularySize }, () => 0),
  );
  for (const row of rows) {
    const inputGradients = gradients[row.input];
    if (!inputGradients) {
      throw new RangeError(`missing gradient row for token ${row.input}`);
    }
    row.probabilities.forEach((probability, target) => {
      const gradient = probability - (target === row.target ? 1 : 0);
      inputGradients[target] = (inputGradients[target] ?? 0) + gradient;
    });
  }
  const scale = learningRate / rows.length;
  const nextWeights = weights.map((row, input) =>
    row.map((weight, target) => weight - scale * (gradients[input]?.[target] ?? 0)),
  );
  const loss = rows.reduce((sum, row) => sum + row.loss, 0) / rows.length;
  return {
    weights: nextWeights,
    rows,
    loss,
    nextLoss: meanTransitionLoss(nextWeights, tokenIds, brokenUnshifted),
  };
}
