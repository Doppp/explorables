import { describe, expect, it } from "vitest";
import { parseModelAtlasDescriptor } from "@explorables/model-atlas";
import deepseek from "./deepseek-v4.json";
import glm from "./glm-5-2.json";
import kimi from "./kimi-k3.json";
import minimax from "./minimax-m1.json";
import qwen from "./qwen-3.json";

const candidates = [deepseek, kimi, qwen, minimax, glm].map(parseModelAtlasDescriptor);

describe("frontier Model Atlas candidate descriptors", () => {
  it("validates every family and keeps scale behind the source-freeze gate", () => {
    expect(candidates.map((descriptor) => descriptor.id)).toEqual([
      "deepseek-v4",
      "kimi-k3",
      "qwen-3-family",
      "minimax-m1",
      "glm-5-2",
    ]);
    for (const descriptor of candidates) {
      expect(descriptor.version).toContain("candidate-view");
      expect(descriptor.stages.some((stage) => stage.evidence === "undisclosed")).toBe(
        true,
      );
      expect(descriptor.stages.every((stage) => stage.count === undefined)).toBe(true);
      expect(descriptor.stages.every((stage) => stage.dimensions === undefined)).toBe(
        true,
      );
    }
  });

  it("uses only reviewed official or primary source locations", () => {
    const allowedHosts = new Set(["arxiv.org", "github.com", "huggingface.co"]);
    for (const descriptor of candidates) {
      for (const source of descriptor.sources) {
        expect(allowedHosts.has(new URL(source.reference).hostname)).toBe(true);
        expect(source.revision).toBeTruthy();
      }
    }
  });
});
