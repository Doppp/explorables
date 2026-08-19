import type { ExplorableModule } from "@explorables/explorable";

const module: ExplorableModule = {
  mount(root, context) {
    const label = document.createElement("label");
    label.textContent = "Input";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "-10";
    input.max = "10";
    input.step = "0.5";
    input.value = "2";
    const output = document.createElement("output");
    output.setAttribute("aria-live", "polite");
    const save = document.createElement("button");
    save.textContent = "Save this run as evidence";
    const render = () => {
      const value = Number(input.value);
      output.value = `${value} × 2 = ${value * 2}`;
    };
    const onSave = () => {
      const value = Number(input.value);
      context.recordExperiment({
        label: `input ${value}`,
        inputs: { value },
        outputs: { result: value * 2 },
      });
    };
    input.addEventListener("input", render);
    save.addEventListener("click", onSave);
    label.append(input, output);
    root.append(label, save);
    render();
    return {
      destroy() {
        input.removeEventListener("input", render);
        save.removeEventListener("click", onSave);
        root.replaceChildren();
      },
    };
  },
};
export default module;
