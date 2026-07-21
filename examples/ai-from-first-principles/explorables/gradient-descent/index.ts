import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { gradient, loss, step } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    let parameter = -4;
    const history: number[] = [parameter];
    const title = element("h2", "Walk the loss curve");
    const controls = element("div", undefined, "controls");
    const rateLabel = element("label", "Learning rate");
    const rate = element("input");
    rate.type = "range";
    rate.min = "0.05";
    rate.max = "1.25";
    rate.step = "0.05";
    rate.value = "0.2";
    const rateOutput = element("output");
    rateLabel.append(rate, rateOutput);
    const takeStep = element("button", "Take one step");
    const reset = element("button", "Reset");
    controls.append(rateLabel, takeStep, reset);
    const state = element("p");
    state.setAttribute("aria-live", "polite");
    const visual = element("div", undefined, "panel");
    visual.style.position = "relative";
    visual.style.height = "150px";
    visual.style.overflow = "hidden";
    const marker = element("div", "θ");
    marker.style.cssText =
      "position:absolute;bottom:20px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#7057e8;color:white;transition:left .2s";
    const minimum = element("div", "minimum θ = 3");
    minimum.style.cssText = "position:absolute;left:68%;bottom:0;font-size:.72rem";
    const curve = element("div");
    curve.style.cssText =
      "position:absolute;left:8%;right:8%;bottom:10px;height:230px;border:4px solid currentColor;border-top-color:transparent;border-left-color:transparent;border-radius:0 0 50% 50%;transform:rotate(45deg);opacity:.35";
    visual.append(curve, marker, minimum);
    const historyText = element("p");
    const render = () => {
      const lr = Number(rate.value);
      rateOutput.value = lr.toFixed(2);
      state.textContent = `θ = ${parameter.toFixed(3)} · loss = ${loss(parameter).toFixed(3)} · gradient = ${gradient(parameter).toFixed(3)}`;
      marker.style.left = `${Math.max(2, Math.min(92, ((parameter + 6) / 14) * 100))}%`;
      historyText.textContent = `History: ${history.map((value) => value.toFixed(2)).join(" → ")}`;
    };
    const onStep = () => {
      parameter = step(parameter, Number(rate.value));
      history.push(parameter);
      render();
      context.emit({
        type: "simulation-completed",
        payload: { parameter, loss: loss(parameter) },
      });
    };
    const onReset = () => {
      parameter = -4;
      history.splice(0, history.length, parameter);
      render();
      context.emit({ type: "state-reset" });
    };
    rate.addEventListener("input", render);
    takeStep.addEventListener("click", onStep);
    reset.addEventListener("click", onReset);
    root.append(styles(), title, controls, state, visual, historyText);
    render();
    return {
      destroy() {
        rate.removeEventListener("input", render);
        takeStep.removeEventListener("click", onStep);
        reset.removeEventListener("click", onReset);
        root.replaceChildren();
      },
    };
  },
};
export default module;
