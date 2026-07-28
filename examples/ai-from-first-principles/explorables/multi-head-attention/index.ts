import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { multiHeadAttention, type AttentionParameters } from "./model.ts";

const identity = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

const parameters: AttentionParameters = {
  queryWeights: identity,
  keyWeights: identity,
  valueWeights: identity,
  outputWeights: identity,
};

function parseVector(input: HTMLInputElement): number[] {
  return input.value.split(",").map((value) => Number(value.trim()));
}

function matrixTable(caption: string, matrix: number[][]): string {
  return `
    <table>
      <caption>${caption}</caption>
      <thead><tr><th>query</th>${matrix.map((_, index) => `<th>T${index + 1}</th>`).join("")}<th>sum</th></tr></thead>
      <tbody>
        ${matrix
          .map(
            (row, index) => `
              <tr>
                <th>T${index + 1}</th>
                ${row.map((value) => `<td>${value.toFixed(3)}</td>`).join("")}
                <td>${row.reduce((sum, value) => sum + value, 0).toFixed(3)}</td>
              </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

const module: ExplorableModule = {
  mount(root, context) {
    const tokenInputs = [
      ["T1 features", "1, 0, 0, 1"],
      ["T2 features", "0.8, 0.2, 1, 0"],
      ["T3 features", "0, 1, 0.5, 0.5"],
    ].map(([labelText, value]) => {
      const label = element("label", labelText);
      const input = element("input");
      input.type = "text";
      input.value = value ?? "";
      input.style.width = "12rem";
      label.append(input);
      return { label, input };
    });

    const causalLabel = element("label", "Causal mask");
    const causal = element("input");
    causal.type = "checkbox";
    causal.checked = true;
    causalLabel.prepend(causal);

    const brokenLabel = element(
      "label",
      "Reuse head 1 features for both heads (broken)",
    );
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);

    const controls = element("div", undefined, "controls");
    controls.append(...tokenInputs.map(({ label }) => label), causalLabel, brokenLabel);
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    const render = () => {
      try {
        const sequence = tokenInputs.map(({ input }) => parseVector(input));
        const result = multiHeadAttention(
          sequence,
          parameters,
          2,
          causal.checked,
          broken.checked,
        );
        output.innerHTML = `
          <p><strong>Model width:</strong> 4 · <strong>heads:</strong> 2 · <strong>head width:</strong> 2</p>
          ${result.heads
            .map((head, index) =>
              matrixTable(`Head ${index + 1} attention weights`, head.weights),
            )
            .join("")}
          <table>
            <caption>Concatenate heads, then apply the output projection</caption>
            <thead><tr><th>token</th><th>concatenated head output</th><th>projected output</th></tr></thead>
            <tbody>
              ${result.output
                .map(
                  (vector, index) => `
                    <tr>
                      <th>T${index + 1}</th>
                      <td>[${result.concatenated[index]?.map((value) => value.toFixed(3)).join(", ")}]</td>
                      <td>[${vector.map((value) => value.toFixed(3)).join(", ")}]</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
          ${broken.checked ? '<p class="warning">Both heads now receive the same feature slice, so their attention matrices and outputs are identical. The second slice is discarded.</p>' : "<p>Each head sees a different contiguous feature slice and can form a different mixing pattern.</p>"}
        `;
        context.emit({
          type: "parameter-changed",
          payload: {
            causal: causal.checked,
            broken: broken.checked,
            headsEqual:
              JSON.stringify(result.heads[0]) === JSON.stringify(result.heads[1]),
          },
        });
      } catch (error) {
        output.replaceChildren(
          element(
            "p",
            `Attention shape error: ${error instanceof Error ? error.message : String(error)}`,
            "warning",
          ),
        );
      }
    };

    const inputs = [...tokenInputs.map(({ input }) => input), causal, broken];
    inputs.forEach((control) => {
      control.addEventListener("input", render);
    });
    root.append(
      styles(),
      element("h2", "Split the residual width into attention heads"),
      element(
        "p",
        "Two heads independently score and mix the sequence before their outputs are concatenated.",
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
        root.replaceChildren();
      },
    };
  },
};

export default module;
