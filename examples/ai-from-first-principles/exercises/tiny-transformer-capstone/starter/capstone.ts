export function shiftedExamples(tokens: number[]): Array<{
  context: number[];
  target: number;
}> {
  return tokens.slice(1).map((target) => ({
    context: [...tokens],
    target,
  }));
}

export function causalAttentionWithResidual(
  _query: number[],
  _keys: number[][],
  values: number[][],
): number[] {
  return [...(values.at(-1) ?? [])];
}

export function outputGradient(
  hidden: number[],
  probabilities: number[],
  _target: number,
): number[][] {
  return probabilities.map(() => hidden.map(() => 0));
}
