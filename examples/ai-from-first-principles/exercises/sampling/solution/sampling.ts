export function nucleus(logits: number[], temperature: number, topP: number): number[] {
  if (!(temperature > 0) || !(topP > 0 && topP <= 1))
    throw new RangeError("invalid decoding parameters");
  const scaled = logits.map((value) => value / temperature);
  const maximum = Math.max(...scaled);
  const exps = scaled.map((value) => Math.exp(value - maximum));
  const total = exps.reduce((a, b) => a + b, 0);
  const sorted = exps
    .map((value, index) => ({ index, probability: value / total }))
    .sort((a, b) => b.probability - a.probability);
  const kept: typeof sorted = [];
  let sum = 0;
  for (const entry of sorted) {
    if (kept.length && sum >= topP) break;
    kept.push(entry);
    sum += entry.probability;
  }
  const output = logits.map(() => 0);
  for (const entry of kept) output[entry.index] = entry.probability / sum;
  return output;
}
