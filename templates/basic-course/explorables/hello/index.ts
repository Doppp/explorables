import type { ExplorableModule } from "@explorables/explorable";

const module: ExplorableModule = {
  mount(root, context) {
    const label = document.createElement("label");
    label.textContent = "Input";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "10";
    input.value = "2";
    const output = document.createElement("output");
    output.setAttribute("aria-live", "polite");
    const render = (emit = true) => {
      const value = Number(input.value);
      output.value = `${value} × 2 = ${value * 2}`;
      if (emit) context.emit({ type: "parameter-changed", payload: { value } });
    };
    const onInput = () => render();
    input.addEventListener("input", onInput);
    label.append(input, output);
    root.append(label);
    render(false);
    return {
      destroy() {
        input.removeEventListener("input", onInput);
        root.replaceChildren();
      },
    };
  },
};
export default module;
