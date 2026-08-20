import type { ExplorableModule } from "@explorables/explorable";
import { element, numberInput, styles } from "../shared.ts";
import { trainOneStep } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    let parameter = -1;
    const title = element("h2", "Trace one learning step");
    const introduction = element(
      "p",
      "The model predicts its parameter. Training compares that prediction with a target, measures the error, and adjusts the parameter.",
    );
    const controls = element("div", undefined, "controls");
    const [parameterLabel, parameterInput] = numberInput(
      "Starting parameter",
      parameter,
      0.5,
    );
    const [targetLabel, targetInput] = numberInput("Target", 3, 0.5);
    const train = element("button", "Train one step and save evidence");
    const infer = element("button", "Run inference only");
    const reset = element("button", "Reset");
    controls.append(parameterLabel, targetLabel, train, infer, reset);
    const flow = element("ol", undefined, "panel");
    const status = element("p");
    status.setAttribute("aria-live", "polite");

    const readInputs = () => ({
      parameter: Number(parameterInput.value),
      target: Number(targetInput.value),
    });
    const renderStartingState = () => {
      const values = readInputs();
      parameter = values.parameter;
      flow.replaceChildren(
        element("li", `Input: this tiny model has no changing input.`),
        element("li", `Prediction: ${parameter.toFixed(2)}.`),
        element(
          "li",
          `Target: hidden until training; set to ${values.target.toFixed(2)} here.`,
        ),
        element("li", "Parameter update: none yet."),
      );
      status.textContent = "Choose values, then compare training with inference.";
    };
    const onTrain = () => {
      const values = readInputs();
      const result = trainOneStep(values.parameter, values.target);
      parameter = result.after;
      parameterInput.value = String(parameter);
      flow.replaceChildren(
        element("li", `Prediction: ${result.prediction.toFixed(2)}.`),
        element("li", `Target: ${result.target.toFixed(2)}.`),
        element("li", `Error: target − prediction = ${result.error.toFixed(2)}.`),
        element("li", `Loss: ${result.loss.toFixed(2)}.`),
        element("li", `Updated parameter: ${result.after.toFixed(2)}.`),
        element("li", `New loss: ${result.nextLoss.toFixed(2)}.`),
      );
      status.textContent = "Training used the target and changed the parameter.";
      context.recordExperiment({
        label: `parameter ${result.before.toFixed(1)} → ${result.after.toFixed(1)}`,
        inputs: { startingParameter: result.before, target: result.target },
        outputs: {
          prediction: result.prediction,
          startingLoss: result.loss,
          updatedParameter: result.after,
          updatedLoss: result.nextLoss,
        },
        summary:
          "Training compared a prediction with a target, then changed the parameter and reduced loss.",
      });
    };
    const onInfer = () => {
      const values = readInputs();
      parameter = values.parameter;
      flow.replaceChildren(
        element("li", `Prediction: ${parameter.toFixed(2)}.`),
        element("li", "Target: not used."),
        element(
          "li",
          `Parameter after inference: ${parameter.toFixed(2)} (unchanged).`,
        ),
      );
      status.textContent =
        "Inference produced a prediction without an answer target or parameter update.";
      context.emit({ type: "inference-ran", payload: { prediction: parameter } });
    };
    const onReset = () => {
      parameterInput.value = "-1";
      targetInput.value = "3";
      renderStartingState();
      context.emit({ type: "state-reset" });
    };

    parameterInput.addEventListener("input", renderStartingState);
    targetInput.addEventListener("input", renderStartingState);
    train.addEventListener("click", onTrain);
    infer.addEventListener("click", onInfer);
    reset.addEventListener("click", onReset);
    root.append(styles(), title, introduction, controls, flow, status);
    renderStartingState();
    return {
      destroy() {
        parameterInput.removeEventListener("input", renderStartingState);
        targetInput.removeEventListener("input", renderStartingState);
        train.removeEventListener("click", onTrain);
        infer.removeEventListener("click", onInfer);
        reset.removeEventListener("click", onReset);
        root.replaceChildren();
      },
    };
  },
};

export default module;
