export function countPairs(corpus: string[][]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of corpus)
    for (let index = 0; index < word.length - 1; index++) {
      const pair = `${word[index]} ${word[index + 1]}`;
      counts.set(pair, (counts.get(pair) ?? 0) + 1);
    }
  return counts;
}
export function merge(corpus: string[][], pair: [string, string]): string[][] {
  return corpus.map((word) => {
    const output: string[] = [];
    for (let index = 0; index < word.length; index++) {
      if (word[index] === pair[0] && word[index + 1] === pair[1]) {
        output.push(pair.join(""));
        index++;
      } else output.push(word[index] ?? "");
    }
    return output;
  });
}
