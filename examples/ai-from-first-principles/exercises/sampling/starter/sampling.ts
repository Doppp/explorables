export function nucleus(logits: number[], temperature: number, topP: number): number[] {
  const values = logits.map((logit) => Math.exp(logit / temperature));
  const total = values.reduce((a, b) => a + b, 0);
  let sum = 0;
  return values.map((value) => {
    const probability = value / total;
    sum += probability;
    return sum <= topP ? probability : 0;
  });
}
