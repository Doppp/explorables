import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { classifyLossTrend, gradient, loss, step } from "./model.ts";

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
    const runExperiment = element("button", "Run four steps and save evidence");
    const reset = element("button", "Reset");
    controls.append(rateLabel, takeStep, runExperiment, reset);
    const state = element("p");
    state.setAttribute("aria-live", "polite");
    const visual = element("div", undefined, "panel");
    visual.style.position = "relative";
    visual.style.height = "150px";
    visual.style.overflow = "hidden";
    const marker = element("div", "θ");
    marker.style.cssText =
      "position:absolute;bottom:20px;width:28px;height:28px;border-radius:35%;display:grid;place-items:center;background:var(--accent);color:var(--on-accent);transition:left .2s";
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
      context.emit({ type: "parameter-changed", payload: { parameter } });
    };
    const onExperiment = () => {
      parameter = -4;
      history.splice(0, history.length, parameter);
      const learningRate = Number(rate.value);
      for (let index = 0; index < 4; index += 1) {
        parameter = step(parameter, learningRate);
        history.push(parameter);
      }
      const finalLoss = loss(parameter);
      const behavior = classifyLossTrend(loss(-4), finalLoss);
      render();
      context.recordExperiment({
        label: `rate ${learningRate.toFixed(2)}`,
        inputs: { startingTheta: -4, learningRate, steps: 4 },
        outputs: {
          finalTheta: Number(parameter.toFixed(3)),
          finalLoss: Number(finalLoss.toFixed(3)),
          behavior,
        },
        summary: `After four steps the run shows ${behavior}.`,
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
    runExperiment.addEventListener("click", onExperiment);
    reset.addEventListener("click", onReset);
    root.append(styles(), title, controls, state, visual, historyText);
    render();
    return {
      destroy() {
        rate.removeEventListener("input", render);
        takeStep.removeEventListener("click", onStep);
        runExperiment.removeEventListener("click", onExperiment);
        reset.removeEventListener("click", onReset);
        root.replaceChildren();
      },
    };
  },
};
export default module;
