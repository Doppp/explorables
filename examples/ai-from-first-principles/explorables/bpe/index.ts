import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import {
  bestPair,
  initialCorpus,
  mergePair,
  pairCounts,
  type Corpus,
} from "./model.ts";

const module: ExplorableModule = {
  mount(root, context) {
    let corpus: Corpus = initialCorpus("low lower lowest");
    let merges = 0;
    const textLabel = element("label", "Training text");
    const text = element("input");
    text.type = "text";
    text.value = "low lower lowest";
    text.style.width = "min(25rem,75vw)";
    textLabel.append(text);
    const brokenLabel = element("label", "Merge first occurrence only (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);
    const merge = element("button", "Merge most frequent pair");
    const reset = element("button", "Reset text");
    const controls = element("div", undefined, "controls");
    controls.append(textLabel, brokenLabel, merge, reset);
    const display = element("div");
    display.setAttribute("aria-live", "polite");
    const render = () => {
      const counts = [...pairCounts(corpus)]
        .sort(([a, ac], [b, bc]) => bc - ac || a.localeCompare(b))
        .slice(0, 8);
      const pair = bestPair(corpus);
      display.innerHTML = `<p>Next pair: <b>${pair?.join(" + ") ?? "none"}</b> · merges learned: ${merges}</p>${corpus.map((word) => `<div class="tokens">${word.map((token) => `<span class="token">${token.replaceAll("<", "&lt;")}</span>`).join("")}</div>`).join("")}<table><caption>Current adjacent-pair counts</caption><thead><tr><th>pair</th><th>count</th></tr></thead><tbody>${counts.map(([name, count]) => `<tr><td>${name.replaceAll("<", "&lt;")}</td><td>${count}</td></tr>`).join("")}</tbody></table>${broken.checked ? '<p class="warning">Broken mode violates the rule by merging only one occurrence.</p>' : ""}`;
    };
    const onMerge = () => {
      const pair = bestPair(corpus);
      if (pair) {
        corpus = mergePair(corpus, pair, broken.checked);
        merges++;
        context.emit({
          type: "simulation-completed",
          payload: { pair: pair.join("") },
        });
        render();
      }
    };
    const onReset = () => {
      corpus = initialCorpus(text.value);
      merges = 0;
      render();
      context.emit({ type: "state-reset" });
    };
    merge.addEventListener("click", onMerge);
    reset.addEventListener("click", onReset);
    broken.addEventListener("input", render);
    root.append(styles(), element("h2", "Learn merge rules"), controls, display);
    render();
    return {
      destroy() {
        merge.removeEventListener("click", onMerge);
        reset.removeEventListener("click", onReset);
        broken.removeEventListener("input", render);
        root.replaceChildren();
      },
    };
  },
};
export default module;
