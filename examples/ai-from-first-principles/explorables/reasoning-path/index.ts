import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";

const activities = [
  {
    name: "Model scores a next token",
    owner: "model",
    inference: true,
    generation: false,
    evidence: "token scores",
  },
  {
    name: "Product selects and appends tokens",
    owner: "product loop",
    inference: false,
    generation: true,
    evidence: "growing text",
  },
  {
    name: "Product runs a calculator",
    owner: "product tool",
    inference: false,
    generation: false,
    evidence: "calculator result",
  },
  {
    name: "Model writes a step-by-step answer",
    owner: "model output",
    inference: true,
    generation: true,
    evidence: "generated text that still needs checking",
  },
] as const;

const module: ExplorableModule = {
  mount(root, context) {
    const title = element("h2", "Separate the work in a problem-solving path");
    const list = element("div", undefined, "controls");
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");
    const show = (index: number) => {
      const activity = activities[index] ?? activities[0];
      output.replaceChildren(
        element("h3", activity.name),
        element("p", `Responsible part: ${activity.owner}`),
        element("p", `Runs model inference: ${activity.inference ? "yes" : "no"}`),
        element(
          "p",
          `Contributes to generation: ${activity.generation ? "yes" : "no"}`,
        ),
        element("p", `Observable evidence: ${activity.evidence}`),
      );
      context.recordExperiment({
        label: activity.name,
        inputs: { activity: activity.name },
        outputs: {
          owner: activity.owner,
          inference: activity.inference,
          generation: activity.generation,
        },
        summary: `Inspect ${activity.evidence}; do not infer correctness from fluency alone.`,
      });
    };
    activities.forEach((activity, index) => {
      const button = element("button", activity.name);
      button.addEventListener("click", () => show(index), { once: true });
      list.append(button);
    });
    root.append(styles(), title, list, output);
    output.append(element("p", "Choose one activity to inspect and save."));
    return {
      destroy() {
        root.replaceChildren();
      },
    };
  },
};

export default module;
