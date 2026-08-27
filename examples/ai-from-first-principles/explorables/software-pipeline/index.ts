import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";

const components = [
  {
    name: "File rule",
    input: "filename",
    output: "photo file",
    responsibility: "Checks the .jpg extension",
    learned: false,
  },
  {
    name: "Image decoder",
    input: "file bytes",
    output: "pixel values",
    responsibility: "Decodes a known file format",
    learned: false,
  },
  {
    name: "Photo model",
    input: "pixel values",
    output: "category scores",
    responsibility: "Predicts a category from learned examples",
    learned: true,
  },
  {
    name: "Interface",
    input: "selected label",
    output: "visible text",
    responsibility: "Displays the result to the user",
    learned: false,
  },
] as const;

const module: ExplorableModule = {
  mount(root, context) {
    const title = element("h2", "Follow one input through the application");
    const label = element("label", "Component to inspect");
    const select = element("select");
    components.forEach((component, index) => {
      const option = element("option", component.name);
      option.value = String(index);
      select.append(option);
    });
    label.append(select);
    const save = element("button", "Save this component");
    const controls = element("div", undefined, "controls");
    controls.append(label, save);
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");
    const selected = () => components[Number(select.value)] ?? components[0];
    const render = () => {
      const component = selected();
      output.replaceChildren(
        element("h3", component.name),
        element("p", `Input: ${component.input}`),
        element("p", `Responsibility: ${component.responsibility}`),
        element("p", `Output: ${component.output}`),
        element(
          "p",
          component.learned ? "Learned behaviour: yes" : "Learned behaviour: no",
        ),
      );
    };
    const onSave = () => {
      const component = selected();
      context.recordExperiment({
        label: component.name,
        inputs: { input: component.input },
        outputs: { output: component.output, learned: component.learned },
        summary: component.responsibility,
      });
    };
    select.addEventListener("input", render);
    save.addEventListener("click", onSave);
    root.append(styles(), title, controls, output);
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
