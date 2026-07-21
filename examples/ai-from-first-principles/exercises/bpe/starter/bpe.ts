export function countPairs(corpus: string[][]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of corpus) {
    const unique = new Set(
      word.slice(0, -1).map((token, index) => `${token} ${word[index + 1]}`),
    );
    for (const pair of unique) counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }
  return counts;
}
export function merge(corpus: string[][], pair: [string, string]): string[][] {
  return corpus.map((word) =>
    word.join(" ").replace(`${pair[0]} ${pair[1]}`, pair.join("")).split(" "),
  );
}
