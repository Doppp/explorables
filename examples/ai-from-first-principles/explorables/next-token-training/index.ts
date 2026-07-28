import type { ExplorableModule } from "@explorables/explorable";
import { element, numberInput, styles } from "../shared.ts";
import { trainTransitionModel, transitionRows } from "./model.ts";

const vocabulary = ["red", "blue", "green"];

function initialWeights(): number[][] {
  return [
    [2, 0, 0],
    [0, 2, 0],
    [0, 0, 2],
  ];
}

function tokenIds(input: HTMLInputElement): number[] {
  return input.value
    .trim()
    .split(/\s+/)
    .map((token) => vocabulary.indexOf(token));
}

const module: ExplorableModule = {
  mount(root, context) {
    const sequenceLabel = element("label", "Training sequence");
    const sequence = element("input");
    sequence.type = "text";
    sequence.value = "red blue red green";
    sequence.style.width = "16rem";
    sequenceLabel.append(sequence);

    const [learningRateLabel, learningRate] = numberInput("Learning rate", 0.5, 0.1);
    learningRate.min = "0.1";
    learningRate.max = "2";

    const brokenLabel = element(
      "label",
      "Use the current token as its own target (broken)",
    );
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);

    const stepButton = element("button", "Take one training step");
    const resetButton = element("button", "Reset");
    const controls = element("div", undefined, "controls");
    controls.append(
      sequenceLabel,
      learningRateLabel,
      brokenLabel,
      stepButton,
      resetButton,
    );
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");
    let weights = initialWeights();
    let step = 0;
    let previousLoss: number | null = null;

    const render = () => {
      try {
        const ids = tokenIds(sequence);
        const rows = transitionRows(weights, ids, broken.checked);
        const loss = rows.reduce((sum, row) => sum + row.loss, 0) / rows.length;
        output.innerHTML = `
          <p><strong>Training step:</strong> ${step} · <strong>mean loss:</strong> ${loss.toFixed(4)}${previousLoss === null ? "" : ` · previous: ${previousLoss.toFixed(4)}`}</p>
          <table>
            <caption>${broken.checked ? "Incorrect unshifted targets" : "Inputs aligned with next-token targets"}</caption>
            <thead><tr><th>position</th><th>input</th><th>target</th><th>predicted</th><th>target probability</th><th>loss</th></tr></thead>
            <tbody>
              ${rows
                .map((row) => {
                  const predicted = row.probabilities.indexOf(
                    Math.max(...row.probabilities),
                  );
                  return `
                    <tr>
                      <th>${row.position}</th>
                      <td>${vocabulary[row.input]}</td>
                      <td>${vocabulary[row.target]}</td>
                      <td>${vocabulary[predicted]}</td>
                      <td>${(row.probabilities[row.target] ?? 0).toFixed(3)}</td>
                      <td>${row.loss.toFixed(3)}</td>
                    </tr>`;
                })
                .join("")}
            </tbody>
          </table>
          ${
            broken.checked
              ? '<p class="warning">The identity-biased model appears accurate because every label repeats its input. It is not learning to predict the following token.</p>'
              : "<p>The final token has no target in this window; every earlier position predicts the token one step to its right.</p>"
          }
        `;
        stepButton.disabled = false;
      } catch (error) {
        stepButton.disabled = true;
        output.replaceChildren(
          element(
            "p",
            `Training data error: ${error instanceof Error ? error.message : String(error)}. Use only red, blue, and green.`,
            "warning",
          ),
        );
      }
    };

    const onStep = () => {
      const result = trainTransitionModel(
        weights,
        tokenIds(sequence),
        Number(learningRate.value),
        broken.checked,
      );
      weights = result.weights;
      previousLoss = result.loss;
      step += 1;
      context.emit({
        type: "simulation-completed",
        payload: {
          step,
          broken: broken.checked,
          loss: result.loss,
          nextLoss: result.nextLoss,
        },
      });
      render();
    };

    const reset = () => {
      weights = initialWeights();
      step = 0;
      previousLoss = null;
      render();
    };

    const inputs = [sequence, learningRate, broken];
    inputs.forEach((control) => {
      control.addEventListener("input", render);
    });
    stepButton.addEventListener("click", onStep);
    resetButton.addEventListener("click", reset);
    root.append(
      styles(),
      element("h2", "Shift the targets, then train"),
      element(
        "p",
        "A tiny transition model uses each token to predict the one immediately following it.",
      ),
      controls,
      output,
    );
    render();

    return {
      destroy() {
        inputs.forEach((control) => {
          control.removeEventListener("input", render);
        });
        stepButton.removeEventListener("click", onStep);
        resetButton.removeEventListener("click", reset);
        root.replaceChildren();
      },
    };
  },
};

export default module;
