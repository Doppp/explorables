import type { ExplorableModule } from "@explorables/explorable";
import { mountModelAtlasComparison } from "@explorables/model-atlas";
import { initialTinyTransformer } from "../tiny-transformer/model.ts";
import deepseek from "./deepseek-v4.json";
import glm from "./glm-5-2.json";
import gpt2 from "./gpt-2-small.json";
import kimi from "./kimi-k3.json";
import minimax from "./minimax-m1.json";
import { createTinyAtlasTrace } from "./model.ts";
import qwen from "./qwen-3.json";

const module: ExplorableModule = {
  mount(root, context) {
    return mountModelAtlasComparison(
      root,
      context,
      [context.config, gpt2, deepseek, kimi, qwen, minimax, glm],
      [createTinyAtlasTrace(initialTinyTransformer(), [0, 1, 2])],
    );
  },
};

export default module;
