import type { ExplorableModule } from "@explorables/explorable";
import { element, numberInput, styles } from "../shared.ts";
import { linearLayer } from "../linear-layers/model.ts";
import {
  crossEntropy,
  initialOptimiserState,
  naiveSoftmax,
  softmax,
  trainClassifier,
  type Classifier,
  type Optimiser,
} from "./model.ts";

const initialModel = (): Classifier => ({
  weights: [
    [0.1, -0.2],
    [-0.1, 0.2],
    [0, 0.1],
  ],
  bias: [0, 0, 0],
});

function format(value: number): string {
  return Number.isFinite(value) ? value.toFixed(4) : "invalid";
}

const module: ExplorableModule = {
  mount(root, context) {
    const optimiserLabel = element("label", "Optimiser");
    const optimiser = element("select");
    for (const value of ["sgd", "momentum", "adamw"] as const) {
      const option = element("option", value === "adamw" ? "AdamW" : value);
      option.value = value;
      optimiser.append(option);
    }
    optimiserLabel.append(optimiser);

    const targetLabel = element("label", "Target class");
    const target = element("select");
    ["cat", "dog", "fox"].forEach((name, index) => {
      const option = element("option", name);
      option.value = String(index);
      if (index === 1) option.selected = true;
      target.append(option);
    });
    targetLabel.append(target);

    const [learningRateLabel, learningRate] = numberInput("Learning rate", 0.2, 0.05);
    learningRate.min = "0.01";
    const [clipLabel, clip] = numberInput("Clip norm", 1, 0.25);
    clip.min = "0.1";
    const [decayLabel, decay] = numberInput("Weight decay", 0, 0.01);
    decay.min = "0";
    const [offsetLabel, offset] = numberInput("Shared logit offset", 0, 100);

    const unstableLabel = element("label", "Use naive softmax (broken)");
    const unstable = element("input");
    unstable.type = "checkbox";
    unstableLabel.prepend(unstable);

    const resetMomentumLabel = element(
      "label",
      "Reset optimiser state each step (broken)",
    );
    const resetMomentum = element("input");
    resetMomentum.type = "checkbox";
    resetMomentumLabel.prepend(resetMomentum);

    const step = element("button", "Take one training step");
    const reset = element("button", "Reset");
    const controls = element("div", undefined, "controls");
    controls.append(
      optimiserLabel,
      targetLabel,
      learningRateLabel,
      clipLabel,
      decayLabel,
      offsetLabel,
      unstableLabel,
      resetMomentumLabel,
      step,
      reset,
    );

    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");
    let model = initialModel();
    let state = initialOptimiserState(9);
    let gradientNorm = 0;
    let clippedGradientNorm = 0;
    let updateNorm = 0;
    let lossHistory: number[] = [];

    const currentValues = () => {
      const logits = linearLayer([1, -1], model.weights, model.bias).map(
        (logit) => logit + Number(offset.value),
      );
      const probabilities = unstable.checked ? naiveSoftmax(logits) : softmax(logits);
      return {
        logits,
        probabilities,
        loss: crossEntropy(logits, Number(target.value)),
      };
    };

    const render = () => {
      const values = currentValues();
      const invalid = values.probabilities.some((value) => !Number.isFinite(value));
      step.disabled = invalid;
      output.innerHTML = `
        <p><strong>Input:</strong> [1, −1] · <strong>step:</strong> ${state.step} · <strong>target:</strong> ${target.options[target.selectedIndex]?.text ?? "unknown"}</p>
        <table>
          <caption>Classifier output</caption>
          <thead><tr><th>class</th><th>logit</th><th>probability</th><th>target?</th></tr></thead>
          <tbody>
            ${["cat", "dog", "fox"]
              .map(
                (name, index) => `
                  <tr>
                    <th>${name}</th>
                    <td>${format(values.logits[index] ?? Number.NaN)}</td>
                    <td>${format(values.probabilities[index] ?? Number.NaN)}</td>
                    <td>${index === Number(target.value) ? "yes" : "no"}</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <p><strong>Cross-entropy:</strong> ${format(values.loss)} · <strong>gradient norm:</strong> ${format(gradientNorm)} → ${format(clippedGradientNorm)} clipped · <strong>update norm:</strong> ${format(updateNorm)}</p>
        <p><strong>Loss history:</strong> ${lossHistory.length === 0 ? "take a step" : lossHistory.slice(-8).map(format).join(" → ")}</p>
        ${invalid ? '<p class="warning">Naive exponentiation overflowed. Stable softmax subtracts the maximum logit first.</p>' : ""}
        ${resetMomentum.checked && optimiser.value !== "sgd" ? '<p class="warning">Resetting state discards the optimiser’s memory before every update.</p>' : ""}
      `;
    };

    const onStep = () => {
      const activeState = resetMomentum.checked ? initialOptimiserState(9) : state;
      const result = trainClassifier(
        model,
        [1, -1],
        Number(target.value),
        activeState,
        {
          kind: optimiser.value as Optimiser,
          learningRate: Number(learningRate.value),
          clippingNorm: Number(clip.value),
          weightDecay: Number(decay.value),
        },
      );
      model = result.model;
      state = result.state;
      gradientNorm = result.gradientNorm;
      clippedGradientNorm = result.clippedGradientNorm;
      updateNorm = result.updateNorm;
      lossHistory.push(result.loss);
      context.emit({
        type: "simulation-completed",
        payload: {
          optimiser: optimiser.value,
          loss: result.loss,
          step: state.step,
        },
      });
      render();
    };

    const resetState = () => {
      model = initialModel();
      state = initialOptimiserState(9);
      gradientNorm = 0;
      clippedGradientNorm = 0;
      updateNorm = 0;
      lossHistory = [];
      render();
    };

    const renderControls = [
      optimiser,
      target,
      learningRate,
      clip,
      decay,
      offset,
      unstable,
      resetMomentum,
    ];
    renderControls.forEach((control) => {
      control.addEventListener("input", render);
    });
    step.addEventListener("click", onStep);
    reset.addEventListener("click", resetState);

    root.append(
      styles(),
      element("h2", "Train a tiny linear classifier"),
      element(
        "p",
        "The target probability determines cross-entropy; the optimiser turns its gradient into a parameter update.",
      ),
      controls,
      output,
    );
    render();

    return {
      destroy() {
        renderControls.forEach((control) => {
          control.removeEventListener("input", render);
        });
        step.removeEventListener("click", onStep);
        reset.removeEventListener("click", resetState);
        root.replaceChildren();
      },
    };
  },
};

export default module;
