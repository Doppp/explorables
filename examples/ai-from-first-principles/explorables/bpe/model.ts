export type Corpus = string[][];

export function initialCorpus(text: string): Corpus {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [...word, "</w>"]);
}

export function pairCounts(corpus: Corpus): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of corpus) {
    for (let index = 0; index < word.length - 1; index++) {
      const key = `${word[index]} ${word[index + 1]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

export function bestPair(corpus: Corpus): [string, string] | null {
  const sorted = [...pairCounts(corpus)].sort(
    ([a, aCount], [b, bCount]) => bCount - aCount || a.localeCompare(b),
  );
  const pair = sorted[0]?.[0];
  return pair ? (pair.split(" ") as [string, string]) : null;
}

export function mergePair(
  corpus: Corpus,
  pair: [string, string],
  firstOnly = false,
): Corpus {
  let mergedOnce = false;
  return corpus.map((word) => {
    const output: string[] = [];
    for (let index = 0; index < word.length; index++) {
      if (
        (!firstOnly || !mergedOnce) &&
        word[index] === pair[0] &&
        word[index + 1] === pair[1]
      ) {
        output.push(pair.join(""));
        index++;
        mergedOnce = true;
      } else output.push(word[index] ?? "");
    }
    return output;
  });
}
