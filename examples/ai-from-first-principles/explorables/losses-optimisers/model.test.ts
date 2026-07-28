import { describe, expect, it } from "vitest";
import {
  clipByGlobalNorm,
  crossEntropy,
  initialOptimiserState,
  optimiserStep,
  softmax,
  trainClassifier,
} from "./model.ts";

describe("losses and optimisers model", () => {
  it("normalises large logits stably", () => {
    expect(softmax([1000, 1000])).toEqual([0.5, 0.5]);
    expect(crossEntropy([1000, 1000], 0)).toBeCloseTo(Math.log(2));
  });

  it("is invariant to a shared logit offset", () => {
    expect(crossEntropy([2, 1, -1], 1)).toBeCloseTo(crossEntropy([1002, 1001, 999], 1));
  });

  it("rejects a non-finite logit", () => {
    expect(() => crossEntropy([0, Number.NaN], 0)).toThrow("finite");
  });

  it("clips magnitude without changing direction", () => {
    const result = clipByGlobalNorm([3, 4], 2.5);
    expect(result.values).toEqual([1.5, 2]);
    expect(result.originalNorm).toBe(5);
    expect(result.clippedNorm).toBe(2.5);
  });

  it("retains momentum across steps", () => {
    const config = {
      kind: "momentum" as const,
      learningRate: 1,
      clippingNorm: 10,
      weightDecay: 0,
      beta1: 0.5,
    };
    const first = optimiserStep([1], [1], initialOptimiserState(1), config);
    const second = optimiserStep(first.parameters, [1], first.state, config);
    expect(first.parameters[0]).toBeCloseTo(0.5);
    expect(second.parameters[0]).toBeCloseTo(-0.25);
    expect(second.state.step).toBe(2);
  });

  it("uses decoupled weight decay", () => {
    const result = optimiserStep([2], [0], initialOptimiserState(1), {
      kind: "sgd",
      learningRate: 0.1,
      clippingNorm: 1,
      weightDecay: 0.5,
    });
    expect(result.parameters).toEqual([1.9]);
  });

  it("reduces classifier loss after repeated SGD steps", () => {
    let model = {
      weights: [
        [0.1, -0.2],
        [-0.1, 0.2],
        [0, 0.1],
      ],
      bias: [0, 0, 0],
    };
    let state = initialOptimiserState(9);
    const config = {
      kind: "sgd" as const,
      learningRate: 0.2,
      clippingNorm: 10,
      weightDecay: 0,
    };
    const initialLoss = trainClassifier(model, [1, -1], 1, state, config).loss;
    for (let index = 0; index < 8; index += 1) {
      const result = trainClassifier(model, [1, -1], 1, state, config);
      model = result.model;
      state = result.state;
    }
    expect(trainClassifier(model, [1, -1], 1, state, config).loss).toBeLessThan(
      initialLoss,
    );
  });
});
