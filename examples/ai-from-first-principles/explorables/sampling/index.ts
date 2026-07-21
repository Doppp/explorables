import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { distribution, truncate } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    const logitsLabel = element("label", "Logits for cat, dog, fox, owl");
    const logits = element("input");
    logits.type = "text";
    logits.value = "2.4, 1.8, 0.7, -0.2";
    logits.style.width = "min(22rem,75vw)";
    logitsLabel.append(logits);
    const temperatureLabel = element("label", "Temperature");
    const temperature = element("input");
    temperature.type = "range";
    temperature.min = "0.1";
    temperature.max = "2";
    temperature.step = "0.1";
    temperature.value = "1";
    temperatureLabel.append(temperature);
    const topKLabel = element("label", "top-k");
    const topK = element("input");
    topK.type = "number";
    topK.min = "1";
    topK.max = "4";
    topK.value = "4";
    topKLabel.append(topK);
    const topPLabel = element("label", "top-p");
    const topP = element("input");
    topP.type = "number";
    topP.min = "0.1";
    topP.max = "1";
    topP.step = "0.05";
    topP.value = "0.9";
    topPLabel.append(topP);
    const brokenLabel = element("label", "Use vocabulary order (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);
    const sample = element("button", "Sample a token");
    const controls = element("div", undefined, "controls");
    controls.append(
      logitsLabel,
      temperatureLabel,
      topKLabel,
      topPLabel,
      brokenLabel,
      sample,
    );
    const output = element("div");
    output.setAttribute("aria-live", "polite");
    let selected = "—";
    const calculate = () =>
      truncate(
        ["cat", "dog", "fox", "owl"],
        distribution(
          logits.value.split(",").map(Number).slice(0, 4),
          Number(temperature.value),
        ),
        Number(topK.value),
        Number(topP.value),
        broken.checked,
      );
    const render = () => {
      const entries = calculate();
      output.innerHTML = `<p>Selected: <b>${selected}</b> · temperature ${Number(temperature.value).toFixed(1)}</p>${entries.map((entry) => `<div style="display:grid;grid-template-columns:3rem 1fr 4rem;gap:.5rem;align-items:center;margin:.4rem 0"><span>${entry.token}</span><span style="height:1rem;background:linear-gradient(90deg,#7057e8 ${entry.probability * 100}%,transparent 0);border:1px solid currentColor"></span><output>${(entry.probability * 100).toFixed(1)}%</output></div>`).join("")}${broken.checked ? '<p class="warning">Broken top-p uses vocabulary order, not descending probability.</p>' : ""}`;
    };
    const onSample = () => {
      const entries = calculate();
      let draw = Math.random();
      selected = entries.at(-1)?.token ?? "—";
      for (const entry of entries) {
        draw -= entry.probability;
        if (draw <= 0) {
          selected = entry.token;
          break;
        }
      }
      context.emit({ type: "simulation-completed", payload: { token: selected } });
      render();
    };
    const inputs = [logits, temperature, topK, topP, broken];
    inputs.forEach((input) => {
      input.addEventListener("input", render);
    });
    sample.addEventListener("click", onSample);
    root.append(
      styles(),
      element("h2", "Shape the next-token distribution"),
      controls,
      output,
    );
    render();
    return {
      destroy() {
        inputs.forEach((input) => {
          input.removeEventListener("input", render);
        });
        sample.removeEventListener("click", onSample);
        root.replaceChildren();
      },
    };
  },
};
export default module;
