import type { ExplorableModule } from "@explorables/explorable";
import { element, numberInput, styles } from "../shared.ts";
import { finiteDifferenceW, forwardBackward } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    const [xLabel, x] = numberInput("x", 2);
    const [wLabel, w] = numberInput("w", -1);
    const [bLabel, b] = numberInput("b", 3);
    const brokenLabel = element("label", "Drop chain-rule factor (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);
    const controls = element("div", undefined, "controls");
    controls.append(xLabel, wLabel, bLabel, brokenLabel);
    const output = element("div");
    output.setAttribute("aria-live", "polite");
    const render = () => {
      const values = forwardBackward(Number(x.value), Number(w.value), Number(b.value));
      const shownDw = broken.checked ? 2 * values.z : values.dw;
      output.innerHTML = `<table><caption>Forward values and backward gradients</caption><thead><tr><th>node</th><th>forward</th><th>gradient of y</th></tr></thead><tbody><tr><td>x</td><td>${Number(x.value).toFixed(2)}</td><td>${values.dx.toFixed(3)}</td></tr><tr><td>w</td><td>${Number(w.value).toFixed(2)}</td><td class="${broken.checked ? "warning" : ""}">${shownDw.toFixed(3)}</td></tr><tr><td>b</td><td>${Number(b.value).toFixed(2)}</td><td>${values.db.toFixed(3)}</td></tr><tr><td>z = xw+b</td><td>${values.z.toFixed(3)}</td><td>${(2 * values.z).toFixed(3)}</td></tr><tr><td>y = z²</td><td>${values.y.toFixed(3)}</td><td>1.000</td></tr></tbody></table><p>Finite-difference dy/dw: <b>${finiteDifferenceW(Number(x.value), Number(w.value), Number(b.value)).toFixed(3)}</b>${broken.checked ? " — mismatch reveals the missing × x" : " — matches backprop"}</p>`;
      context.emit({
        type: "parameter-changed",
        payload: { x: Number(x.value), w: Number(w.value), broken: broken.checked },
      });
    };
    const inputs = [x, w, b, broken];
    inputs.forEach((input) => {
      input.addEventListener("input", render);
    });
    root.append(styles(), element("h2", "Trace the chain rule"), controls, output);
    render();
    return {
      destroy() {
        inputs.forEach((input) => {
          input.removeEventListener("input", render);
        });
        root.replaceChildren();
      },
    };
  },
};
export default module;
