export interface Cache {
  keys: number[][];
  values: number[][];
}

function validateVector(vector: number[], width: number, name: string): void {
  if (vector.length !== width || vector.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain ${width} finite values`);
  }
}

export function appendCache(cache: Cache, key: number[], value: number[]): Cache {
  if (key.length === 0) throw new RangeError("cache vectors must not be empty");
  validateVector(value, key.length, "value");
  if (cache.keys.length !== cache.values.length) {
    throw new RangeError("cache keys and values must have equal lengths");
  }
  cache.keys.forEach((entry) => {
    validateVector(entry, key.length, "cached key");
  });
  cache.values.forEach((entry) => {
    validateVector(entry, key.length, "cached value");
  });
  return {
    keys: [...cache.keys, [...key]],
    values: [...cache.values, [...value]],
  };
}

export function cachedAttention(query: number[], cache: Cache): number[] {
  if (
    query.length === 0 ||
    cache.keys.length === 0 ||
    cache.keys.length !== cache.values.length
  ) {
    throw new RangeError("attention needs a query and matching cache entries");
  }
  cache.keys.forEach((entry) => {
    validateVector(entry, query.length, "cached key");
  });
  cache.values.forEach((entry) => {
    validateVector(entry, query.length, "cached value");
  });
  const scores = cache.keys.map(
    (key) =>
      key.reduce((sum, value, index) => sum + value * (query[index] ?? 0), 0) /
      Math.sqrt(query.length),
  );
  const maximum = Math.max(...scores);
  const exponents = scores.map((score) => Math.exp(score - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  const weights = exponents.map((value) => value / total);
  return Array.from({ length: query.length }, (_, dimension) =>
    weights.reduce(
      (sum, weight, index) => sum + weight * (cache.values[index]?.[dimension] ?? 0),
      0,
    ),
  );
}
