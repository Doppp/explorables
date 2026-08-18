import { fireEvent } from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("three", () => {
  class Node {
    position = { set: vi.fn() };
    scale = { setScalar: vi.fn() };
    add = vi.fn();
  }
  class Geometry {
    dispose = vi.fn();
  }
  class Material {
    color = { set: vi.fn() };
    dispose = vi.fn();
  }
  return {
    BoxGeometry: Geometry,
    DirectionalLight: Node,
    Group: Node,
    Mesh: class extends Node {
      constructor(
        public geometry: Geometry,
        public material: Material,
      ) {
        super();
      }
    },
    MeshStandardMaterial: Material,
    PerspectiveCamera: class extends Node {
      aspect = 1;
      lookAt = vi.fn();
      updateProjectionMatrix = vi.fn();
    },
    Scene: Node,
    WebGLRenderer: class {
      setPixelRatio = vi.fn();
      setSize = vi.fn();
      render = vi.fn();
      dispose = vi.fn();
    },
  };
});

import type { ExplorableContext } from "@explorables/explorable";
import { mountModelAtlas } from "./renderer.ts";

const descriptor = {
  kind: "model-atlas",
  schemaVersion: 1,
  id: "test-model",
  name: "Test model",
  version: "v1",
  summary: "A bounded model.",
  sources: [
    {
      id: "tested-source",
      label: "Test source",
      reference: "model.ts",
      evidence: "executable",
    },
  ],
  stages: [
    {
      id: "tokens",
      title: "Tokens",
      summary: "Input tokens.",
      kind: "tokens",
      evidence: "executable",
      sourceIds: ["tested-source"],
    },
    {
      id: "output",
      title: "Output",
      summary: "Output logits.",
      kind: "output",
      evidence: "executable",
      sourceIds: ["tested-source"],
    },
  ],
};

const trace = {
  descriptorId: "test-model",
  traceId: "test-trace",
  tokens: ["A"],
  steps: [
    {
      stageId: "tokens",
      values: [[0]],
      rowLabels: ["prompt"],
      columnLabels: ["position 0"],
    },
  ],
};

describe("model Atlas renderer", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it("keeps every stage and evidence label available without the canvas", () => {
    const root = document.createElement("div");
    const emit = vi.fn();
    const context: ExplorableContext = {
      instanceId: "atlas",
      lessonId: "lesson",
      config: null,
      emit,
      recordExperiment: vi.fn(),
    };
    const handle = mountModelAtlas(root, context, descriptor, trace);

    expect(root.querySelectorAll(".atlas-outline button")).toHaveLength(2);
    expect(root.textContent).toContain("executable evidence");
    expect(root.textContent).toContain("0.000");
    fireEvent.click(root.querySelectorAll("button")[1] as HTMLButtonElement);
    expect(root.textContent).toContain("no executable tensor trace");
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "parameter-changed" }),
    );

    handle.destroy?.();
    expect(root.childElementCount).toBe(0);
  });
});
