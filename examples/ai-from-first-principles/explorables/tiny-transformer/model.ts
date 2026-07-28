import { dot, type Matrix, type Vector } from "../linear-layers/model.ts";
import { rmsNorm } from "../transformer-block/model.ts";

export const vocabulary = ["A", "B", "C"] as const;
export const trainingCorpus = [0, 1, 2, 0, 1, 2, 0, 1, 2];

export interface TinyTransformer {
  embeddings: Matrix;
  outputWeights: Matrix;
}

export type FailureMode = "none" | "future-leak" | "replace-residual";

export interface TokenTrace {
  position: number;
  token: number;
  attentionWeights: Vector;
  attentionOutput: Vector;
  hidden: Vector;
  logits: Vector;
}

export interface ForwardTrace {
  tokens: TokenTrace[];
}

export interface LossGradient {
  loss: number;
  gradient: Matrix;
}

export interface TrainingResult {
  model: TinyTransformer;
  losses: number[];
}

interface Cache {
  keys: Matrix;
  values: Matrix;
}

function zeros(rows: number, columns: number): Matrix {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => 0));
}

function cloneModel(model: TinyTransformer): TinyTransformer {
  return {
    embeddings: model.embeddings.map((row) => [...row]),
    outputWeights: model.outputWeights.map((row) => [...row]),
  };
}

function validateModel(model: TinyTransformer): number {
  const width = model.embeddings[0]?.length ?? 0;
  if (
    model.embeddings.length !== vocabulary.length ||
    width === 0 ||
    model.embeddings.some(
      (row) => row.length !== width || row.some((value) => !Number.isFinite(value)),
    )
  ) {
    throw new RangeError("embeddings must have one finite, fixed-width row per token");
  }
  if (
    model.outputWeights.length !== vocabulary.length ||
    model.outputWeights.some(
      (row) => row.length !== width || row.some((value) => !Number.isFinite(value)),
    )
  ) {
    throw new RangeError(
      "output weights must have one finite row per token and embedding dimension",
    );
  }
  return width;
}

function validateTokens(tokens: number[]): void {
  if (tokens.length === 0) throw new RangeError("token sequence must not be empty");
  tokens.forEach((token) => {
    if (!Number.isInteger(token) || token < 0 || token >= vocabulary.length) {
      throw new RangeError(`token id ${token} is outside the vocabulary`);
    }
  });
}

function softmax(logits: Vector): Vector {
  const maximum = Math.max(...logits);
  const exponents = logits.map((logit) => Math.exp(logit - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

function attention(
  query: Vector,
  keys: Matrix,
  values: Matrix,
): { weights: Vector; output: Vector } {
  const scores = keys.map((key) => dot(query, key) / Math.sqrt(query.length));
  const weights = softmax(scores);
  const output = Array.from({ length: query.length }, (_, dimension) =>
    weights.reduce(
      (sum, weight, index) => sum + weight * (values[index]?.[dimension] ?? 0),
      0,
    ),
  );
  return { weights, output };
}

function add(left: Vector, right: Vector): Vector {
  if (left.length !== right.length) {
    throw new RangeError("residual vectors must have equal widths");
  }
  return left.map((value, index) => value + (right[index] ?? 0));
}

function logitsForHidden(model: TinyTransformer, hidden: Vector): Vector {
  return model.outputWeights.map((row) => dot(row, hidden));
}

export function initialTinyTransformer(): TinyTransformer {
  return {
    embeddings: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    outputWeights: zeros(vocabulary.length, vocabulary.length),
  };
}

export function forward(
  model: TinyTransformer,
  tokens: number[],
  failureMode: FailureMode = "none",
): ForwardTrace {
  const width = validateModel(model);
  validateTokens(tokens);
  const embeddings = tokens.map((token) => [...(model.embeddings[token] ?? [])]);
  const traces = embeddings.map((embedding, position) => {
    const end = failureMode === "future-leak" ? embeddings.length : position + 1;
    const attended = attention(
      embedding,
      embeddings.slice(0, end),
      embeddings.slice(0, end),
    );
    const residual =
      failureMode === "replace-residual"
        ? attended.output
        : add(embedding, attended.output);
    const hidden = rmsNorm(
      residual,
      Array.from({ length: width }, () => 1),
    );
    return {
      position,
      token: tokens[position] ?? 0,
      attentionWeights: attended.weights,
      attentionOutput: attended.output,
      hidden,
      logits: logitsForHidden(model, hidden),
    };
  });
  return { tokens: traces };
}

export function shiftedExamples(tokens: number[]): Array<{
  context: number[];
  target: number;
}> {
  validateTokens(tokens);
  if (tokens.length < 2) {
    throw new RangeError("next-token training needs at least two tokens");
  }
  return tokens.slice(1).map((target, index) => ({
    context: tokens.slice(0, index + 1),
    target,
  }));
}

export function lossAndGradient(
  model: TinyTransformer,
  corpus: number[],
  failureMode: FailureMode = "none",
): LossGradient {
  const width = validateModel(model);
  const examples = shiftedExamples(corpus);
  const gradient = zeros(vocabulary.length, width);
  let totalLoss = 0;
  for (const example of examples) {
    const trace = forward(model, example.context, failureMode).tokens.at(-1);
    if (!trace) throw new RangeError("training context produced no trace");
    const probabilities = softmax(trace.logits);
    totalLoss -= Math.log(probabilities[example.target] ?? Number.MIN_VALUE);
    probabilities.forEach((probability, token) => {
      const logitGradient = probability - (token === example.target ? 1 : 0);
      trace.hidden.forEach((value, dimension) => {
        const row = gradient[token];
        if (row) {
          row[dimension] =
            (row[dimension] ?? 0) + (logitGradient * value) / examples.length;
        }
      });
    });
  }
  return { loss: totalLoss / examples.length, gradient };
}

export function trainTinyTransformer(
  model: TinyTransformer,
  corpus: number[],
  steps: number,
  learningRate: number,
  failureMode: FailureMode = "none",
): TrainingResult {
  if (!Number.isInteger(steps) || steps < 0) {
    throw new RangeError("training steps must be a non-negative integer");
  }
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new RangeError("learning rate must be positive and finite");
  }
  let trained = cloneModel(model);
  const losses = [lossAndGradient(trained, corpus, failureMode).loss];
  for (let step = 0; step < steps; step += 1) {
    const result = lossAndGradient(trained, corpus, failureMode);
    trained = {
      embeddings: trained.embeddings.map((row) => [...row]),
      outputWeights: trained.outputWeights.map((row, token) =>
        row.map(
          (weight, dimension) =>
            weight - learningRate * (result.gradient[token]?.[dimension] ?? 0),
        ),
      ),
    };
    losses.push(lossAndGradient(trained, corpus, failureMode).loss);
  }
  return { model: trained, losses };
}

function cachedToken(
  model: TinyTransformer,
  token: number,
  cache: Cache,
  failureMode: FailureMode,
): { cache: Cache; trace: TokenTrace } {
  validateTokens([token]);
  const width = validateModel(model);
  const embedding = [...(model.embeddings[token] ?? [])];
  const nextCache = {
    keys: [...cache.keys, embedding],
    values: [...cache.values, embedding],
  };
  const attended = attention(embedding, nextCache.keys, nextCache.values);
  const residual =
    failureMode === "replace-residual"
      ? attended.output
      : add(embedding, attended.output);
  const hidden = rmsNorm(
    residual,
    Array.from({ length: width }, () => 1),
  );
  return {
    cache: nextCache,
    trace: {
      position: nextCache.keys.length - 1,
      token,
      attentionWeights: attended.weights,
      attentionOutput: attended.output,
      hidden,
      logits: logitsForHidden(model, hidden),
    },
  };
}

function argmax(values: Vector): number {
  return values.reduce(
    (best, value, index) => (value > (values[best] ?? -Infinity) ? index : best),
    0,
  );
}

export function generate(
  model: TinyTransformer,
  prompt: number[],
  newTokens: number,
  cached: boolean,
  failureMode: FailureMode = "none",
): number[] {
  validateModel(model);
  validateTokens(prompt);
  if (!Number.isInteger(newTokens) || newTokens < 0) {
    throw new RangeError("new token count must be a non-negative integer");
  }
  const generated = [...prompt];
  if (!cached) {
    for (let step = 0; step < newTokens; step += 1) {
      const trace = forward(model, generated, failureMode).tokens.at(-1);
      if (!trace) throw new RangeError("generation produced no trace");
      generated.push(argmax(trace.logits));
    }
    return generated;
  }
  if (failureMode === "future-leak") {
    throw new RangeError(
      "future-leaking attention cannot be used for cached generation",
    );
  }
  let cache: Cache = { keys: [], values: [] };
  let latest: TokenTrace | undefined;
  for (const token of prompt) {
    const result = cachedToken(model, token, cache, failureMode);
    cache = result.cache;
    latest = result.trace;
  }
  for (let step = 0; step < newTokens; step += 1) {
    if (!latest) throw new RangeError("generation produced no trace");
    const next = argmax(latest.logits);
    generated.push(next);
    const result = cachedToken(model, next, cache, failureMode);
    cache = result.cache;
    latest = result.trace;
  }
  return generated;
}

export function nextTokenAccuracy(
  model: TinyTransformer,
  evaluationCorpus: number[],
): number {
  const examples = shiftedExamples(evaluationCorpus);
  const correct = examples.filter((example) => {
    const trace = forward(model, example.context).tokens.at(-1);
    return trace ? argmax(trace.logits) === example.target : false;
  }).length;
  return correct / examples.length;
}

export function evaluateClaim(
  model: TinyTransformer,
  trainingData: number[],
  heldOutData: number[],
  brokenReuseTrainingData = false,
): { accuracy: number; claim: string } {
  const selected = brokenReuseTrainingData ? trainingData : heldOutData;
  return {
    accuracy: nextTokenAccuracy(model, selected),
    claim: brokenReuseTrainingData
      ? "training-set fit; not held-out generalisation"
      : "held-out next-token accuracy",
  };
}
