import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { dotTerms, linearLayer, matrixShape, transpose, type Matrix } from "./model.ts";

function parseValues(input: HTMLInputElement): number[] {
  return input.value.split(",").map((value) => Number(value.trim()));
}

function format(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "invalid";
}

const module: ExplorableModule = {
  mount(root, context) {
    const inputLabel = element("label", "Input vector x (3 values)");
    const input = element("input");
    input.type = "text";
    input.value = "2, -1, 0.5";
    input.style.width = "12rem";
    inputLabel.append(input);

    const firstRowLabel = element("label", "Weight row W₀");
    const firstRow = element("input");
    firstRow.type = "text";
    firstRow.value = "1, 2, 0";
    firstRow.style.width = "12rem";
    firstRowLabel.append(firstRow);

    const secondRowLabel = element("label", "Weight row W₁");
    const secondRow = element("input");
    secondRow.type = "text";
    secondRow.value = "-1, 0, 4";
    secondRow.style.width = "12rem";
    secondRowLabel.append(secondRow);

    const biasLabel = element("label", "Bias b (2 values)");
    const bias = element("input");
    bias.type = "text";
    bias.value = "0.5, -0.5";
    bias.style.width = "9rem";
    biasLabel.append(bias);

    const brokenLabel = element("label", "Transpose W before multiplying (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);

    const controls = element("div", undefined, "controls");
    controls.append(inputLabel, firstRowLabel, secondRowLabel, biasLabel, brokenLabel);

    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    const render = () => {
      const inputValues = parseValues(input);
      const originalWeights: Matrix = [parseValues(firstRow), parseValues(secondRow)];
      const biasValues = parseValues(bias);
      try {
        const effectiveWeights = broken.checked
          ? transpose(originalWeights)
          : originalWeights;
        const [rows, columns] = matrixShape(effectiveWeights);
        const result = linearLayer(inputValues, effectiveWeights, biasValues);
        const calculations = effectiveWeights.map((row, index) =>
          dotTerms(inputValues, row, biasValues[index] ?? 0),
        );
        output.innerHTML = `
          <p><strong>Shape:</strong> W [${rows} × ${columns}] · x [${inputValues.length}] · b [${biasValues.length}] → y [${result.length}]</p>
          <table>
            <caption>One dot product per output</caption>
            <thead><tr><th>output</th><th>products</th><th>bias</th><th>result</th></tr></thead>
            <tbody>
              ${calculations
                .map(
                  (calculation, index) => `
                    <tr>
                      <th>y${index}</th>
                      <td>${calculation.products.map(format).join(" + ")}</td>
                      <td>${format(biasValues[index] ?? 0)}</td>
                      <td>${format(calculation.total)}</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
          <p><strong>Output vector:</strong> [${result.map(format).join(", ")}]</p>
        `;
        context.emit({
          type: "parameter-changed",
          payload: { broken: broken.checked, output: result },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        output.replaceChildren(
          element("p", `Shape error: ${message}`, "warning"),
          element(
            "p",
            "A linear layer needs one weight column per input value and one bias per weight row.",
          ),
        );
        context.emit({
          type: "parameter-changed",
          payload: { broken: broken.checked, error: message },
        });
      }
    };

    const inputs = [input, firstRow, secondRow, bias, broken];
    inputs.forEach((control) => {
      control.addEventListener("input", render);
    });
    root.append(
      styles(),
      element("h2", "Trace a linear projection"),
      element("p", "Each weight row forms one dot product with the input vector."),
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
