import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { attentionWeights } from "./model.ts";

function values(input: HTMLInputElement): number[] {
  return input.value.split(",").map(Number).slice(0, 3);
}
const module: ExplorableModule = {
  mount(root, context) {
    const qLabel = element("label", "Queries (3 values)");
    const q = element("input");
    q.type = "text";
    q.value = "1, 0.5, -1";
    qLabel.append(q);
    const kLabel = element("label", "Keys (3 values)");
    const k = element("input");
    k.type = "text";
    k.value = "1, 2, -1";
    kLabel.append(k);
    const causalLabel = element("label", "Causal mask");
    const causal = element("input");
    causal.type = "checkbox";
    causal.checked = true;
    causalLabel.prepend(causal);
    const brokenLabel = element("label", "Mask after softmax (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);
    const controls = element("div", undefined, "controls");
    const saveExperiment = element("button", "Save this matrix as evidence");
    controls.append(qLabel, kLabel, causalLabel, brokenLabel, saveExperiment);
    const output = element("div");
    output.setAttribute("aria-live", "polite");
    const render = () => {
      const queries = values(q);
      const keys = values(k);
      const rows = attentionWeights(queries, keys, causal.checked, broken.checked);
      const scores = queries.map((query, row) =>
        keys.map((key, column) =>
          causal.checked && column > row ? "mask" : (query * key).toFixed(2),
        ),
      );
      const matrix = (caption: string, data: Array<Array<string | number>>) =>
        `<table><caption>${caption}</caption><thead><tr><th>from \\ to</th><th>T1</th><th>T2</th><th>T3</th><th>row sum</th></tr></thead><tbody>${data.map((row, index) => `<tr><th>T${index + 1}</th>${row.map((value) => `<td>${typeof value === "number" ? value.toFixed(3) : value}</td>`).join("")}<td>${row.reduce<number>((sum, value) => sum + (typeof value === "number" ? value : 0), 0).toFixed(3)}</td></tr>`).join("")}</tbody></table>`;
      output.innerHTML =
        matrix("Scaled scores (dimension 1)", scores) +
        matrix("Attention weights", rows) +
        (broken.checked && causal.checked
          ? '<p class="warning">Rows below 1 reveal post-softmax masking without renormalisation.</p>'
          : "");
      context.emit({ type: "parameter-changed" });
    };
    const onSaveExperiment = () => {
      const queries = values(q);
      const keys = values(k);
      const rows = attentionWeights(queries, keys, causal.checked, broken.checked);
      const rowSums = rows.map((row) => row.reduce((sum, weight) => sum + weight, 0));
      const futureWeight = rows.reduce(
        (sum, row, rowIndex) =>
          sum +
          row.reduce(
            (rowSum, weight, columnIndex) =>
              rowSum + (columnIndex > rowIndex ? weight : 0),
            0,
          ),
        0,
      );
      context.recordExperiment({
        label: broken.checked ? "broken masking" : "valid masking",
        inputs: {
          queries: q.value,
          keys: k.value,
          causalMask: causal.checked,
          maskAfterSoftmax: broken.checked,
        },
        outputs: {
          rowSums: rowSums.map((sum) => sum.toFixed(3)).join(", "),
          futureWeight: Number(futureWeight.toFixed(3)),
        },
        summary: broken.checked
          ? "Post-softmax masking breaks normalisation."
          : "Valid masked attention keeps each non-empty row normalised.",
      });
    };
    const inputs = [q, k, causal, broken];
    inputs.forEach((input) => {
      input.addEventListener("input", render);
    });
    saveExperiment.addEventListener("click", onSaveExperiment);
    root.append(
      styles(),
      element("h2", "Inspect score and weight matrices"),
      controls,
      output,
    );
    render();
    return {
      destroy() {
        inputs.forEach((input) => {
          input.removeEventListener("input", render);
        });
        saveExperiment.removeEventListener("click", onSaveExperiment);
        root.replaceChildren();
      },
    };
  },
};
export default module;
