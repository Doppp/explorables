import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { vectorNorm } from "../losses-optimisers/model.ts";
import { transformerBlock, type TransformerBlockParameters } from "./model.ts";

function parseVector(input: HTMLInputElement): number[] {
  return input.value.split(",").map((value) => Number(value.trim()));
}

function formatVector(vector: number[]): string {
  return `[${vector.map((value) => value.toFixed(3)).join(", ")}]`;
}

function parameters(attentionScale: number): TransformerBlockParameters {
  return {
    firstNormScale: [1, 1, 1, 1],
    secondNormScale: [1, 1, 1, 1],
    attentionWeights: [
      [attentionScale, 0, 0, 0],
      [0, attentionScale, 0, 0],
      [0, 0, attentionScale, 0],
      [0, 0, 0, attentionScale],
    ],
    gateWeights: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ],
    valueWeights: [
      [0.5, 0, 0, 0],
      [0, 0.5, 0, 0],
      [0, 0, 0.5, 0],
    ],
    downWeights: [
      [0.5, 0, 0],
      [0, 0.5, 0],
      [0, 0, 0.5],
      [0.2, 0.2, 0.2],
    ],
  };
}

const module: ExplorableModule = {
  mount(root, context) {
    const inputLabel = element("label", "Residual-stream vector");
    const input = element("input");
    input.type = "text";
    input.value = "1, -1, 0.5, 0.25";
    input.style.width = "13rem";
    inputLabel.append(input);

    const scaleLabel = element("label", "Attention update scale");
    const scale = element("input");
    scale.type = "range";
    scale.min = "0";
    scale.max = "0.8";
    scale.step = "0.1";
    scale.value = "0.2";
    scaleLabel.append(scale);

    const brokenLabel = element("label", "Replace instead of add residuals (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);

    const controls = element("div", undefined, "controls");
    controls.append(inputLabel, scaleLabel, brokenLabel);
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    const render = () => {
      try {
        const trace = transformerBlock(
          parseVector(input),
          parameters(Number(scale.value)),
          broken.checked,
        );
        const rows: Array<[string, number[]]> = [
          ["input residual stream", trace.input],
          ["RMSNorm 1", trace.firstNormalised],
          ["attention update", trace.attentionDelta],
          [
            broken.checked ? "attention replacement" : "after residual add 1",
            trace.afterAttention,
          ],
          ["RMSNorm 2", trace.secondNormalised],
          ["SwiGLU hidden", trace.mlpHidden],
          ["MLP update", trace.mlpDelta],
          [
            broken.checked ? "MLP replacement" : "output after residual add 2",
            trace.output,
          ],
        ];
        output.innerHTML = `
          <table>
            <caption>Pre-norm Transformer block trace</caption>
            <thead><tr><th>stage</th><th>vector</th><th>L2 norm</th></tr></thead>
            <tbody>
              ${rows
                .map(
                  ([name, vector]) => `
                    <tr>
                      <th>${name}</th>
                      <td>${formatVector(vector)}</td>
                      <td>${vectorNorm(vector).toFixed(3)}</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
          ${
            broken.checked
              ? '<p class="warning">Replacing the residual stream removes the identity path. With zero sublayer updates, the block would erase its input.</p>'
              : "<p>Each sublayer contributes an update while the residual stream preserves an unchanged path through the block.</p>"
          }
        `;
        context.emit({
          type: "parameter-changed",
          payload: {
            broken: broken.checked,
            inputNorm: vectorNorm(trace.input),
            outputNorm: vectorNorm(trace.output),
          },
        });
      } catch (error) {
        output.replaceChildren(
          element(
            "p",
            `Block shape error: ${error instanceof Error ? error.message : String(error)}`,
            "warning",
          ),
        );
      }
    };

    const inputs = [input, scale, broken];
    inputs.forEach((control) => {
      control.addEventListener("input", render);
    });
    root.append(
      styles(),
      element("h2", "Trace one token through a Transformer block"),
      element(
        "p",
        "RMSNorm prepares each sublayer; attention and SwiGLU contribute updates to the residual stream.",
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
