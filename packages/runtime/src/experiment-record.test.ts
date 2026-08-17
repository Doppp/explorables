import { describe, expect, it } from "vitest";
import { createExperimentRecord } from "./experiment-record.ts";

describe("experiment records", () => {
  it("normalises a bounded scalar experiment payload", () => {
    expect(
      createExperimentRecord(
        {
          label: "rate 1.1",
          inputs: { rate: 1.1, stable: false },
          outputs: { loss: 42 },
          summary: "The run diverged.",
        },
        { instanceId: "stepper", checkpointId: "experiment" },
        { id: "run-1", recordedAt: "2026-08-17T00:00:00.000Z" },
      ),
    ).toMatchObject({
      id: "run-1",
      instanceId: "stepper",
      checkpointId: "experiment",
      inputs: { rate: 1.1, stable: false },
      outputs: { loss: 42 },
    });
  });

  it("rejects malformed, nested, non-finite, and oversized records", () => {
    const metadata = { instanceId: "stepper", checkpointId: "experiment" };
    expect(createExperimentRecord({ inputs: {}, outputs: {} }, metadata)).toBeNull();
    expect(
      createExperimentRecord(
        { inputs: { nested: { unsafe: true } }, outputs: { result: 1 } },
        metadata,
      ),
    ).toBeNull();
    expect(
      createExperimentRecord(
        { inputs: { rate: Number.NaN }, outputs: { result: 1 } },
        metadata,
      ),
    ).toBeNull();
    expect(
      createExperimentRecord(
        { label: true, inputs: { rate: 1 }, outputs: { result: 1 } },
        metadata,
      ),
    ).toBeNull();
    expect(
      createExperimentRecord(
        { inputs: { text: "x".repeat(9000) }, outputs: { result: 1 } },
        metadata,
      ),
    ).toBeNull();
  });
});
