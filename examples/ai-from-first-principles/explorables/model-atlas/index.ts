import type { ExplorableModule } from "@explorables/explorable";
import { mountModelAtlasComparison } from "@explorables/model-atlas";
import { initialTinyTransformer } from "../tiny-transformer/model.ts";
import gpt2 from "./gpt-2-small.json";
import { createTinyAtlasTrace } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    return mountModelAtlasComparison(
      root,
      context,
      [context.config, gpt2],
      [createTinyAtlasTrace(initialTinyTransformer(), [0, 1, 2])],
    );
  },
};

export default module;
