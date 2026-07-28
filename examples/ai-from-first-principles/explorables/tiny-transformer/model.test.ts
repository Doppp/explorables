import { describe, expect, it } from "vitest";
import {
  evaluateClaim,
  forward,
  generate,
  initialTinyTransformer,
  lossAndGradient,
  trainingCorpus,
  trainTinyTransformer,
} from "./model.ts";

describe("tiny Transformer capstone", () => {
  it("trains deterministically and decreases next-token loss", () => {
    const first = trainTinyTransformer(
      initialTinyTransformer(),
      trainingCorpus,
      80,
      0.2,
    );
    const second = trainTinyTransformer(
      initialTinyTransformer(),
      trainingCorpus,
      80,
      0.2,
    );
    expect(first).toEqual(second);
    expect(first.losses.at(-1)).toBeLessThan((first.losses[0] ?? 0) * 0.25);
  });

  it("matches an output-weight gradient with finite differences", () => {
    const model = initialTinyTransformer();
    const analytic = lossAndGradient(model, trainingCorpus).gradient[1]?.[0] ?? 0;
    const epsilon = 1e-5;
    const plus = structuredClone(model);
    const minus = structuredClone(model);
    if (plus.outputWeights[1] && minus.outputWeights[1]) {
      plus.outputWeights[1][0] = (plus.outputWeights[1][0] ?? 0) + epsilon;
      minus.outputWeights[1][0] = (minus.outputWeights[1][0] ?? 0) - epsilon;
    }
    const numeric =
      (lossAndGradient(plus, trainingCorpus).loss -
        lossAndGradient(minus, trainingCorpus).loss) /
      (2 * epsilon);
    expect(analytic).toBeCloseTo(numeric, 5);
  });

  it("generates the same tokens with cached and uncached inference", () => {
    const trained = trainTinyTransformer(
      initialTinyTransformer(),
      trainingCorpus,
      80,
      0.2,
    ).model;
    const uncached = generate(trained, [0, 1], 6, false);
    const cached = generate(trained, [0, 1], 6, true);
    expect(cached).toEqual(uncached);
    expect(cached).toEqual([0, 1, 2, 0, 1, 2, 0, 1]);
  });

  it("makes masking, residual, and shape failures observable", () => {
    const model = trainTinyTransformer(
      initialTinyTransformer(),
      trainingCorpus,
      20,
      0.2,
    ).model;
    const causal = forward(model, [0, 1, 2]).tokens[0];
    const leaking = forward(model, [0, 1, 2], "future-leak").tokens[0];
    const replaced = forward(model, [0, 1, 2], "replace-residual").tokens[0];
    expect(leaking?.hidden).not.toEqual(causal?.hidden);
    expect(replaced?.hidden).not.toEqual(causal?.hidden);
    expect(() => forward({ ...model, outputWeights: [[0, 0]] }, [0])).toThrow(
      /output weights/,
    );
  });

  it("labels training reuse instead of presenting it as held-out evidence", () => {
    const trained = trainTinyTransformer(
      initialTinyTransformer(),
      trainingCorpus,
      80,
      0.2,
    ).model;
    const heldOut = [0, 2, 1, 0, 2, 1];
    const valid = evaluateClaim(trained, trainingCorpus, heldOut);
    const broken = evaluateClaim(trained, trainingCorpus, heldOut, true);
    expect(broken.accuracy).toBeGreaterThan(valid.accuracy);
    expect(broken.claim).toMatch(/not held-out/);
    expect(valid.claim).toMatch(/held-out/);
  });
});
