import { dot, type Matrix, type Vector } from "../linear-layers/model.ts";

export interface KeyValueCache {
  keys: Matrix;
  values: Matrix;
}

export interface DecodeStep {
  position: number;
  stage: "prefill" | "decode";
  output: Vector;
  cacheTokens: number;
  projectionWork: number;
}

export interface DecodeTrace {
  steps: DecodeStep[];
  totalProjectionWork: number;
  cacheCells: number;
}

function validateVector(vector: Vector, width: number, name: string): void {
  if (vector.length !== width || vector.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must have ${width} finite values`);
  }
}

function validateSequence(sequence: Matrix): number {
  const width = sequence[0]?.length ?? 0;
  if (sequence.length === 0 || width === 0) {
    throw new RangeError("decoding needs a non-empty sequence");
  }
  sequence.forEach((vector) => {
    validateVector(vector, width, "token vector");
  });
  return width;
}

function softmax(values: Vector): Vector {
  const maximum = Math.max(...values);
  const exponents = values.map((value) => Math.exp(value - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map((value) => value / total);
}

export function attend(query: Vector, keys: Matrix, values: Matrix): Vector {
  const width = query.length;
  if (width === 0 || keys.length === 0 || keys.length !== values.length) {
    throw new RangeError("attention needs a query and matching cached keys and values");
  }
  validateVector(query, width, "query");
  keys.forEach((key) => {
    validateVector(key, width, "cached key");
  });
  values.forEach((value) => {
    validateVector(value, width, "cached value");
  });
  const weights = softmax(keys.map((key) => dot(query, key) / Math.sqrt(width)));
  return Array.from({ length: width }, (_, dimension) =>
    weights.reduce(
      (sum, weight, index) => sum + weight * (values[index]?.[dimension] ?? 0),
      0,
    ),
  );
}

export function appendCache(
  cache: KeyValueCache,
  key: Vector,
  value: Vector,
  brokenDropHistory = false,
): KeyValueCache {
  const width = key.length;
  if (width === 0) throw new RangeError("cache vectors must not be empty");
  validateVector(key, width, "key");
  validateVector(value, width, "value");
  cache.keys.forEach((cached) => {
    validateVector(cached, width, "cached key");
  });
  cache.values.forEach((cached) => {
    validateVector(cached, width, "cached value");
  });
  if (cache.keys.length !== cache.values.length) {
    throw new RangeError("cache keys and values must have equal lengths");
  }
  return brokenDropHistory
    ? { keys: [[...key]], values: [[...value]] }
    : {
        keys: [...cache.keys, [...key]],
        values: [...cache.values, [...value]],
      };
}

export function decodeWithoutCache(
  sequence: Matrix,
  promptLength: number,
): DecodeTrace {
  const width = validateSequence(sequence);
  if (
    !Number.isInteger(promptLength) ||
    promptLength < 1 ||
    promptLength > sequence.length
  ) {
    throw new RangeError("prompt length must select at least one sequence token");
  }
  let totalProjectionWork = 0;
  const steps: DecodeStep[] = [];
  for (let position = promptLength - 1; position < sequence.length; position += 1) {
    const prefix = sequence.slice(0, position + 1);
    totalProjectionWork += prefix.length * 3;
    steps.push({
      position,
      stage: position === promptLength - 1 ? "prefill" : "decode",
      output: attend(sequence[position] ?? [], prefix, prefix),
      cacheTokens: 0,
      projectionWork: totalProjectionWork,
    });
  }
  return { steps, totalProjectionWork, cacheCells: 0 * width };
}

export function decodeWithCache(
  sequence: Matrix,
  promptLength: number,
  brokenDropHistory = false,
): DecodeTrace {
  const width = validateSequence(sequence);
  if (
    !Number.isInteger(promptLength) ||
    promptLength < 1 ||
    promptLength > sequence.length
  ) {
    throw new RangeError("prompt length must select at least one sequence token");
  }
  let cache: KeyValueCache = { keys: [], values: [] };
  let totalProjectionWork = 0;
  const steps: DecodeStep[] = [];
  for (let position = 0; position < sequence.length; position += 1) {
    const token = sequence[position] ?? [];
    cache = appendCache(cache, token, token, brokenDropHistory);
    totalProjectionWork += 3;
    if (position >= promptLength - 1) {
      steps.push({
        position,
        stage: position === promptLength - 1 ? "prefill" : "decode",
        output: attend(token, cache.keys, cache.values),
        cacheTokens: cache.keys.length,
        projectionWork: totalProjectionWork,
      });
    }
  }
  return {
    steps,
    totalProjectionWork,
    cacheCells: cache.keys.length * width * 2,
  };
}

export function maximumOutputDifference(left: DecodeTrace, right: DecodeTrace): number {
  if (left.steps.length !== right.steps.length) {
    throw new RangeError("decode traces must contain the same number of steps");
  }
  return left.steps.reduce((maximum, step, index) => {
    const other = right.steps[index];
    if (!other || step.output.length !== other.output.length) {
      throw new RangeError("decode trace outputs must have matching widths");
    }
    return Math.max(
      maximum,
      ...step.output.map((value, dimension) =>
        Math.abs(value - (other.output[dimension] ?? 0)),
      ),
    );
  }, 0);
}
