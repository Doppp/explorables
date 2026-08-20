import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { appendToken, chooseToken, nextTokenCandidates, tokenize } from "./model.ts";

const draws = [0.12, 0.64, 0.08, 0.9];

const module: ExplorableModule = {
  mount(root, context) {
    let text = "The cat";
    let step = 0;
    const title = element("h2", "Run the next-token loop");
    const introduction = element(
      "p",
      "At each step the model reads the growing context, scores possible next tokens, and selects exactly one.",
    );
    const prompt = element("p", undefined, "panel");
    const tokens = element("div", undefined, "tokens");
    const distribution = element("div");
    distribution.setAttribute("aria-live", "polite");
    const generate = element("button", "Generate one token");
    const reset = element("button", "Reset");
    const controls = element("div", undefined, "controls");
    controls.append(generate, reset);

    const render = () => {
      const candidates = nextTokenCandidates(text);
      prompt.textContent = `Current text: ${text}`;
      tokens.replaceChildren(
        ...tokenize(text).map((token) => element("span", token, "token")),
      );
      const list = element("ol", undefined, "panel");
      for (const candidate of candidates)
        list.append(
          element(
            "li",
            `${candidate.token === "." ? "[period]" : candidate.token}: ${(candidate.probability * 100).toFixed(0)}%`,
          ),
        );
      distribution.replaceChildren(
        element("h3", `Next-token probabilities at step ${step + 1}`),
        list,
      );
    };
    const onGenerate = () => {
      const before = text;
      const candidates = nextTokenCandidates(before);
      const selected = chooseToken(candidates, draws[step % draws.length] ?? 0);
      text = appendToken(before, selected);
      step += 1;
      context.recordExperiment({
        label: `Step ${step}: ${selected}`,
        inputs: { context: before, contextTokens: tokenize(before).length },
        outputs: { selectedToken: selected, newContext: text },
        summary:
          "One sampled token was appended and became part of the next model input.",
      });
      render();
    };
    const onReset = () => {
      text = "The cat";
      step = 0;
      render();
      context.emit({ type: "state-reset" });
    };
    generate.addEventListener("click", onGenerate);
    reset.addEventListener("click", onReset);
    root.append(styles(), title, introduction, prompt, tokens, controls, distribution);
    render();
    return {
      destroy() {
        generate.removeEventListener("click", onGenerate);
        reset.removeEventListener("click", onReset);
        root.replaceChildren();
      },
    };
  },
};

export default module;
