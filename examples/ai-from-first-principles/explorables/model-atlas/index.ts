import type { ExplorableModule } from "@explorables/explorable";
import { mountModelAtlas } from "@explorables/model-atlas";
import { initialTinyTransformer } from "../tiny-transformer/model.ts";
import { createTinyAtlasTrace } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    return mountModelAtlas(
      root,
      context,
      context.config,
      createTinyAtlasTrace(initialTinyTransformer(), [0, 1, 2]),
    );
  },
};

export default module;
