export interface Candidate {
  token: string;
  probability: number;
}

const distributions: Record<string, Candidate[]> = {
  "the cat": [
    { token: "sat", probability: 0.55 },
    { token: "slept", probability: 0.3 },
    { token: "purred", probability: 0.15 },
  ],
  "the cat sat": [
    { token: "on", probability: 0.72 },
    { token: ".", probability: 0.18 },
    { token: "quietly", probability: 0.1 },
  ],
  "the cat sat on": [
    { token: "the", probability: 0.81 },
    { token: "a", probability: 0.19 },
  ],
};

export function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function nextTokenCandidates(text: string): Candidate[] {
  return (
    distributions[text.trim().toLowerCase()] ?? [
      { token: "the", probability: 0.5 },
      { token: "a", probability: 0.3 },
      { token: ".", probability: 0.2 },
    ]
  );
}

export function chooseToken(candidates: Candidate[], draw: number): string {
  if (!(draw >= 0 && draw < 1)) throw new RangeError("draw must be in [0, 1)");
  let remaining = draw;
  for (const candidate of candidates) {
    remaining -= candidate.probability;
    if (remaining < 0) return candidate.token;
  }
  return candidates.at(-1)?.token ?? "";
}

export function appendToken(text: string, token: string): string {
  return token === "." ? `${text.trim()}.` : `${text.trim()} ${token}`;
}
