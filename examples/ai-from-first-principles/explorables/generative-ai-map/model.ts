export type ExampleId = "rules" | "classifier" | "image-generator" | "chatbot";

export interface SystemProfile {
  id: ExampleId;
  name: string;
  learned: boolean;
  generative: boolean;
  languageModel: boolean;
  productSystem: boolean;
  explanation: string;
}

const profiles: Record<ExampleId, SystemProfile> = {
  rules: {
    id: "rules",
    name: "Rule-based spell checker",
    learned: false,
    generative: false,
    languageModel: false,
    productSystem: true,
    explanation:
      "A programmed AI system can use explicit rules without a learned model.",
  },
  classifier: {
    id: "classifier",
    name: "Photo classifier",
    learned: true,
    generative: false,
    languageModel: false,
    productSystem: true,
    explanation:
      "It learns from examples, but chooses a label rather than generating content.",
  },
  "image-generator": {
    id: "image-generator",
    name: "Image generator",
    learned: true,
    generative: true,
    languageModel: false,
    productSystem: true,
    explanation:
      "It generates new content, but its main output is an image rather than language.",
  },
  chatbot: {
    id: "chatbot",
    name: "LLM chat product",
    learned: true,
    generative: true,
    languageModel: true,
    productSystem: true,
    explanation:
      "The language model generates tokens; the surrounding product also supplies instructions, tools, retrieval, and interface behaviour.",
  },
};

export function systemProfile(id: ExampleId): SystemProfile {
  return profiles[id];
}

export function allSystemProfiles(): SystemProfile[] {
  return Object.values(profiles);
}
