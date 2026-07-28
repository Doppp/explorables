import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import {
  decodeWithCache,
  decodeWithoutCache,
  maximumOutputDifference,
} from "./model.ts";

const tokens = [
  { name: "red", vector: [1, 0] },
  { name: "blue", vector: [0, 1] },
  { name: "purple", vector: [1, 1] },
  { name: "violet", vector: [-1, 1] },
  { name: "red", vector: [1, 0] },
  { name: "blue", vector: [0, 1] },
  { name: "purple", vector: [1, 1] },
  { name: "violet", vector: [-1, 1] },
];

const module: ExplorableModule = {
  mount(root, context) {
    const tokenCountLabel = element("label", "Total tokens");
    const tokenCount = element("input");
    tokenCount.type = "range";
    tokenCount.min = "2";
    tokenCount.max = "8";
    tokenCount.value = "6";
    tokenCountLabel.append(tokenCount);

    const promptLengthLabel = element("label", "Prompt tokens");
    const promptLength = element("input");
    promptLength.type = "range";
    promptLength.min = "1";
    promptLength.max = tokenCount.value;
    promptLength.value = "3";
    promptLengthLabel.append(promptLength);

    const brokenLabel = element("label", "Keep only the newest key and value (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);

    const controls = element("div", undefined, "controls");
    controls.append(tokenCountLabel, promptLengthLabel, brokenLabel);
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    const render = () => {
      const count = Number(tokenCount.value);
      promptLength.max = String(count);
      if (Number(promptLength.value) > count) promptLength.value = String(count);
      const prompt = Number(promptLength.value);
      const selected = tokens.slice(0, count);
      const vectors = selected.map(({ vector }) => vector);
      const uncached = decodeWithoutCache(vectors, prompt);
      const cached = decodeWithCache(vectors, prompt, broken.checked);
      const difference = maximumOutputDifference(uncached, cached);
      const saved = uncached.totalProjectionWork - cached.totalProjectionWork;
      output.innerHTML = `
        <div class="tokens" aria-label="Token sequence">
          ${selected
            .map(
              ({ name }, index) =>
                `<span class="token">${index < prompt ? "prompt" : "decode"} · ${name}</span>`,
            )
            .join("")}
        </div>
        <p><strong>Uncached projection work:</strong> ${uncached.totalProjectionWork} · <strong>cached:</strong> ${cached.totalProjectionWork} · <strong>saved:</strong> ${saved}</p>
        <p><strong>Final KV memory:</strong> ${cached.cacheCells} scalar cells · <strong>maximum output difference:</strong> ${difference.toFixed(6)}</p>
        <table>
          <caption>Prefill and decoding trace</caption>
          <thead><tr><th>position</th><th>stage</th><th>cached tokens</th><th>cumulative work</th><th>attention output</th></tr></thead>
          <tbody>${cached.steps
            .map(
              (step) =>
                `<tr><th>${step.position}</th><td>${step.stage}</td><td>${step.cacheTokens}</td><td>${step.projectionWork}</td><td>[${step.output.map((value) => value.toFixed(3)).join(", ")}]</td></tr>`,
            )
            .join("")}</tbody>
        </table>
        ${
          broken.checked
            ? '<p class="warning">Dropping history saves memory by changing the computation: the current query can no longer attend to earlier tokens.</p>'
            : "<p>The cached path matches full recomputation. It stores each projected key and value so decoding only projects the new token.</p>"
        }
      `;
      context.emit({
        type: "parameter-changed",
        payload: {
          tokens: count,
          prompt,
          broken: broken.checked,
          outputDifference: difference,
        },
      });
    };

    const controlsToWatch = [tokenCount, promptLength, broken];
    controlsToWatch.forEach((control) => {
      control.addEventListener("input", render);
    });
    root.append(
      styles(),
      element("h2", "Reuse the past without changing the answer"),
      element(
        "p",
        "Prefill creates keys and values for the prompt; each decode step appends one new pair.",
      ),
      controls,
      output,
    );
    render();

    return {
      destroy() {
        controlsToWatch.forEach((control) => {
          control.removeEventListener("input", render);
        });
        root.replaceChildren();
      },
    };
  },
};

export default module;
