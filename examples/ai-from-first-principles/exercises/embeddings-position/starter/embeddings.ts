export function embeddingLookup(table: number[][], tokenIds: number[]): number[][] {
  return tokenIds.map((tokenId) => table[tokenId] ?? []);
}

export function rotatePairs(vector: number[], position: number): number[] {
  return vector.map((value) => value + position);
}
