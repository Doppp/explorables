import type { ExplorableModule } from "@explorables/explorable";
import { element, numberInput, styles } from "../shared.ts";
import {
  evaluateClaim,
  forward,
  generate,
  initialTinyTransformer,
  type TinyTransformer,
  trainingCorpus,
  trainTinyTransformer,
  vocabulary,
} from "./model.ts";

const heldOutCorpus = [0, 2, 1, 0, 2, 1];

const module: ExplorableModule = {
  mount(root, context) {
    const [stepLabel, stepCount] = numberInput("Steps per click", 20, 1);
    stepCount.min = "1";
    stepCount.max = "100";
    const [rateLabel, learningRate] = numberInput("Learning rate", 0.2, 0.05);
    learningRate.min = "0.05";
    learningRate.max = "1";
    const brokenResidualLabel = element(
      "label",
      "Replace the residual stream (broken)",
    );
    const brokenResidual = element("input");
    brokenResidual.type = "checkbox";
    brokenResidualLabel.prepend(brokenResidual);
    const brokenEvaluationLabel = element(
      "label",
      "Evaluate on training tokens (broken claim)",
    );
    const brokenEvaluation = element("input");
    brokenEvaluation.type = "checkbox";
    brokenEvaluationLabel.prepend(brokenEvaluation);
    const trainButton = element("button", "Train");
    const resetButton = element("button", "Reset");
    const controls = element("div", undefined, "controls");
    controls.append(
      stepLabel,
      rateLabel,
      brokenResidualLabel,
      brokenEvaluationLabel,
      trainButton,
      resetButton,
    );
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    let model: TinyTransformer = initialTinyTransformer();
    let completedSteps = 0;
    let latestLoss = trainTinyTransformer(model, trainingCorpus, 0, 0.2).losses[0] ?? 0;

    const render = () => {
      const failure = brokenResidual.checked ? "replace-residual" : "none";
      const cached = generate(model, [0, 1], 6, true, failure);
      const uncached = generate(model, [0, 1], 6, false, failure);
      const trace = forward(model, cached, failure).tokens.at(-1);
      const evaluation = evaluateClaim(
        model,
        trainingCorpus,
        heldOutCorpus,
        brokenEvaluation.checked,
      );
      output.innerHTML = `
        <p><strong>Training steps:</strong> ${completedSteps} · <strong>mean loss:</strong> ${latestLoss.toFixed(4)}</p>
        <div class="tokens" aria-label="Generated token sequence">${cached
          .map(
            (token, index) =>
              `<span class="token">${index < 2 ? "prompt" : "generated"} · ${vocabulary[token]}</span>`,
          )
          .join("")}</div>
        <p><strong>Cached equals uncached:</strong> ${cached.join(",") === uncached.join(",") ? "yes" : "no"}</p>
        <p><strong>Final hidden state:</strong> [${trace?.hidden.map((value) => value.toFixed(3)).join(", ") ?? ""}]</p>
        <p><strong>Evaluation:</strong> ${(evaluation.accuracy * 100).toFixed(1)}% · ${evaluation.claim}</p>
        ${
          brokenResidual.checked
            ? '<p class="warning">Replacing the residual removes the token identity path. The model still emits logits, but it is no longer the intended block.</p>'
            : ""
        }
        ${
          brokenEvaluation.checked
            ? '<p class="warning">This flattering score reuses training examples. It cannot support a held-out generalisation claim.</p>'
            : ""
        }
      `;
    };

    const train = () => {
      const steps = Number(stepCount.value);
      const result = trainTinyTransformer(
        model,
        trainingCorpus,
        steps,
        Number(learningRate.value),
        brokenResidual.checked ? "replace-residual" : "none",
      );
      model = result.model;
      completedSteps += steps;
      latestLoss = result.losses.at(-1) ?? latestLoss;
      context.emit({
        type: "simulation-completed",
        payload: { steps: completedSteps, loss: latestLoss },
      });
      render();
    };
    const reset = () => {
      model = initialTinyTransformer();
      completedSteps = 0;
      latestLoss = trainTinyTransformer(model, trainingCorpus, 0, 0.2).losses[0] ?? 0;
      context.emit({ type: "state-reset" });
      render();
    };
    const rerender = () => render();
    trainButton.addEventListener("click", train);
    resetButton.addEventListener("click", reset);
    brokenResidual.addEventListener("input", rerender);
    brokenEvaluation.addEventListener("input", rerender);
    root.append(
      styles(),
      element("h2", "Train, generate, and challenge the claim"),
      element(
        "p",
        "A one-layer, three-token Transformer trains its language-model head while exposing causal attention and cached decoding.",
      ),
      controls,
      output,
    );
    render();

    return {
      destroy() {
        trainButton.removeEventListener("click", train);
        resetButton.removeEventListener("click", reset);
        brokenResidual.removeEventListener("input", rerender);
        brokenEvaluation.removeEventListener("input", rerender);
        root.replaceChildren();
      },
    };
  },
};

export default module;
