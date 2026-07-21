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
    controls.append(qLabel, kLabel, causalLabel, brokenLabel);
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
      context.emit({
        type: "parameter-changed",
        payload: { causal: causal.checked, broken: broken.checked },
      });
    };
    const inputs = [q, k, causal, broken];
    inputs.forEach((input) => {
      input.addEventListener("input", render);
    });
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
        root.replaceChildren();
      },
    };
  },
};
export default module;
