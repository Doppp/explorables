import { describe, expect, it } from "vitest";
import { allSystemProfiles, systemProfile } from "./model.ts";

describe("generative AI term map", () => {
  it("separates learned systems from generative systems", () => {
    expect(systemProfile("classifier")).toMatchObject({
      learned: true,
      generative: false,
    });
    expect(systemProfile("image-generator")).toMatchObject({
      learned: true,
      generative: true,
      languageModel: false,
    });
  });

  it("keeps an LLM distinct from its surrounding chat product", () => {
    expect(systemProfile("chatbot").explanation).toContain("surrounding product");
    expect(allSystemProfiles()).toHaveLength(4);
  });
});
