import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { memoriserAccuracy, splitExamples, type Example } from "./model.ts";

const examples: Example[] = ["A", "B", "C", "D"].flatMap((family) =>
  [1, 2, 3].map((variant) => ({ family, variant })),
);
const module: ExplorableModule = {
  mount(root, context) {
    const leakyLabel = element("label", "Leak task families across the boundary");
    const leaky = element("input");
    leaky.type = "checkbox";
    leakyLabel.prepend(leaky);
    const output = element("div");
    output.setAttribute("aria-live", "polite");
    const render = () => {
      const rows = splitExamples(examples, leaky.checked);
      const accuracy = memoriserAccuracy(rows);
      output.innerHTML = `<p>Memoriser test accuracy: <b>${(accuracy * 100).toFixed(0)}%</b> · split unit: ${leaky.checked ? "example (leaky)" : "family (grouped)"}</p><table><caption>Train/test assignment</caption><thead><tr><th>task variant</th><th>split</th><th>family seen in train?</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.family}-${row.variant}</td><td>${row.split}</td><td class="${row.seen ? "warning" : ""}">${row.split === "train" ? "—" : row.seen ? "yes (leak)" : "no"}</td></tr>`).join("")}</tbody></table>${leaky.checked ? '<p class="warning">The high score measures recognition of known families, not generalisation to new ones.</p>' : ""}`;
      context.emit({
        type: "parameter-changed",
        payload: { leaky: leaky.checked, accuracy },
      });
    };
    leaky.addEventListener("input", render);
    root.append(
      styles(),
      element("h2", "Split examples or independent families?"),
      leakyLabel,
      output,
    );
    render();
    return {
      destroy() {
        leaky.removeEventListener("input", render);
        root.replaceChildren();
      },
    };
  },
};
export default module;
