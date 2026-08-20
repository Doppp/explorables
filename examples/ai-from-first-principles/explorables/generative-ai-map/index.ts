import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { type ExampleId, systemProfile } from "./model.ts";

const choices: Array<[ExampleId, string]> = [
  ["rules", "Rule-based spell checker"],
  ["classifier", "Photo classifier"],
  ["image-generator", "Image generator"],
  ["chatbot", "LLM chat product"],
];

const module: ExplorableModule = {
  mount(root, context) {
    const title = element("h2", "Map the terms onto real systems");
    const introduction = element(
      "p",
      "Choose a system and inspect which labels actually apply. The categories overlap, but they are not synonyms.",
    );
    const label = element("label", "System to inspect");
    const select = element("select");
    for (const [id, name] of choices) {
      const option = element("option", name);
      option.value = id;
      select.append(option);
    }
    label.append(select);
    const save = element("button", "Save this classification");
    const controls = element("div", undefined, "controls");
    controls.append(label, save);
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    const render = () => {
      const profile = systemProfile(select.value as ExampleId);
      const list = element("ul");
      const facts: Array<[string, boolean]> = [
        ["Uses learned parameters", profile.learned],
        ["Generates new content", profile.generative],
        ["Is a language model", profile.languageModel],
        ["Is a complete product system", profile.productSystem],
      ];
      for (const [fact, applies] of facts)
        list.append(element("li", `${applies ? "Yes" : "No"} — ${fact}`));
      output.replaceChildren(
        element("h3", profile.name),
        list,
        element("p", profile.explanation),
      );
      context.emit({ type: "system-selected", payload: { id: profile.id } });
    };
    const onSave = () => {
      const profile = systemProfile(select.value as ExampleId);
      context.recordExperiment({
        label: profile.name,
        inputs: { system: profile.id },
        outputs: {
          learned: profile.learned,
          generative: profile.generative,
          languageModel: profile.languageModel,
          productSystem: profile.productSystem,
        },
        summary: profile.explanation,
      });
    };
    select.addEventListener("input", render);
    save.addEventListener("click", onSave);
    root.append(styles(), title, introduction, controls, output);
    render();
    return {
      destroy() {
        select.removeEventListener("input", render);
        save.removeEventListener("click", onSave);
        root.replaceChildren();
      },
    };
  },
};

export default module;
