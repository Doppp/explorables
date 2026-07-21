export interface TokenProbability {
  token: string;
  probability: number;
}

export function distribution(logits: number[], temperature: number): number[] {
  if (!(temperature > 0)) throw new RangeError("temperature must be positive");
  const scaled = logits.map((logit) => logit / temperature);
  const maximum = Math.max(...scaled);
  const values = scaled.map((value) => Math.exp(value - maximum));
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
}

export function truncate(
  tokens: string[],
  probabilities: number[],
  topK: number,
  topP: number,
  brokenOrder = false,
): TokenProbability[] {
  const entries = tokens.map((token, index) => ({
    token,
    probability: probabilities[index] ?? 0,
  }));
  if (!brokenOrder) entries.sort((a, b) => b.probability - a.probability);
  const kept: TokenProbability[] = [];
  let cumulative = 0;
  for (const entry of entries.slice(0, Math.max(1, topK))) {
    if (kept.length > 0 && cumulative >= topP) break;
    kept.push(entry);
    cumulative += entry.probability;
  }
  const total = kept.reduce((sum, entry) => sum + entry.probability, 0);
  return kept.map((entry) => ({ ...entry, probability: entry.probability / total }));
}
