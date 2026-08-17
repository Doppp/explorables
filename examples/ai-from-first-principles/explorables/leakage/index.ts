import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { memoriserAccuracy, splitExamples, type Example } from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    const familyLabel = element("label", "Task families");
    const familyCount = element("input");
    familyCount.type = "number";
    familyCount.min = "4";
    familyCount.max = "8";
    familyCount.value = "4";
    familyLabel.append(familyCount);
    const variantLabel = element("label", "Variants per family");
    const variantCount = element("input");
    variantCount.type = "number";
    variantCount.min = "2";
    variantCount.max = "6";
    variantCount.value = "3";
    variantLabel.append(variantCount);
    const leakyLabel = element("label", "Leak task families across the boundary");
    const leaky = element("input");
    leaky.type = "checkbox";
    leakyLabel.prepend(leaky);
    const output = element("div");
    output.setAttribute("aria-live", "polite");
    const saveExperiment = element("button", "Save this split as evidence");
    const currentExamples = (): Example[] =>
      Array.from({ length: Number(familyCount.value) }, (_, index) =>
        String.fromCharCode(65 + index),
      ).flatMap((family) =>
        Array.from({ length: Number(variantCount.value) }, (_, index) => ({
          family,
          variant: index + 1,
        })),
      );
    const render = () => {
      const rows = splitExamples(currentExamples(), leaky.checked);
      const accuracy = memoriserAccuracy(rows);
      output.innerHTML = `<p>Memoriser test accuracy: <b>${(accuracy * 100).toFixed(0)}%</b> · split unit: ${leaky.checked ? "example (leaky)" : "family (grouped)"}</p><table><caption>Train/test assignment</caption><thead><tr><th>task variant</th><th>split</th><th>family seen in train?</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.family}-${row.variant}</td><td>${row.split}</td><td class="${row.seen ? "warning" : ""}">${row.split === "train" ? "—" : row.seen ? "yes (leak)" : "no"}</td></tr>`).join("")}</tbody></table>${leaky.checked ? '<p class="warning">The high score measures recognition of known families, not generalisation to new ones.</p>' : ""}`;
      context.emit({ type: "parameter-changed" });
    };
    const onSaveExperiment = () => {
      const examples = currentExamples();
      const rows = splitExamples(examples, leaky.checked);
      const accuracy = memoriserAccuracy(rows);
      context.recordExperiment({
        label: leaky.checked ? "example split" : "family split",
        inputs: {
          families: Number(familyCount.value),
          variantsPerFamily: Number(variantCount.value),
          splitUnit: leaky.checked ? "example" : "family",
        },
        outputs: {
          testExamples: rows.filter((row) => row.split === "test").length,
          leakedTestExamples: rows.filter((row) => row.split === "test" && row.seen)
            .length,
          memoriserAccuracy: `${(accuracy * 100).toFixed(0)}%`,
        },
        summary: leaky.checked
          ? "The score rewards recognition of families already seen in training."
          : "The grouped split measures transfer to unseen families.",
      });
    };
    const inputs = [familyCount, variantCount, leaky];
    inputs.forEach((input) => {
      input.addEventListener("input", render);
    });
    saveExperiment.addEventListener("click", onSaveExperiment);
    root.append(
      styles(),
      element("h2", "Split examples or independent families?"),
      familyLabel,
      variantLabel,
      leakyLabel,
      saveExperiment,
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
