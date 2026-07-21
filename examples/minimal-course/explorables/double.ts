import type { ExplorableModule } from "@explorables/explorable";

const explorable: ExplorableModule = {
  mount(root, context) {
    const label = document.createElement("label");
    label.textContent = "Input value";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "10";
    input.value = "3";
    const output = document.createElement("output");
    output.setAttribute("aria-live", "polite");
    const render = () => {
      const value = Number(input.value);
      output.value = `${value} × 2 = ${value * 2}`;
      context.emit({
        type: "parameter-changed",
        payload: { value, result: value * 2 },
      });
    };
    input.addEventListener("input", render);
    label.append(input, output);
    root.append(label);
    render();
    return {
      destroy() {
        input.removeEventListener("input", render);
        root.replaceChildren();
      },
    };
  },
};

export default explorable;
