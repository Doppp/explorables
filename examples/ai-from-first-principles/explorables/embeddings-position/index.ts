import type { ExplorableModule } from "@explorables/explorable";
import { element, styles } from "../shared.ts";
import { cosineSimilarity, embeddingLookup, rotatePairs } from "./model.ts";

const vocabulary = ["cat", "dog", "runs", "sleeps"];
const table = [
  [1, 0.2, 0.1, -0.1],
  [0.9, 0.3, 0, -0.2],
  [-0.2, 0.8, 0.7, 0.1],
  [-0.1, 0.7, -0.6, 0.3],
];

function formatVector(vector: number[]): string {
  return `[${vector.map((value) => value.toFixed(3)).join(", ")}]`;
}

const module: ExplorableModule = {
  mount(root, context) {
    const tokenLabel = element("label", "Token");
    const token = element("select");
    vocabulary.forEach((name, index) => {
      const option = element("option", name);
      option.value = String(index);
      token.append(option);
    });
    tokenLabel.append(token);

    const compareLabel = element("label", "Compare with");
    const compare = element("select");
    vocabulary.forEach((name, index) => {
      const option = element("option", name);
      option.value = String(index);
      if (index === 1) option.selected = true;
      compare.append(option);
    });
    compareLabel.append(compare);

    const positionLabel = element("label", "Position");
    const position = element("input");
    position.type = "range";
    position.min = "0";
    position.max = "12";
    position.step = "1";
    position.value = "0";
    positionLabel.append(position);

    const brokenLabel = element("label", "Add position to every coordinate (broken)");
    const broken = element("input");
    broken.type = "checkbox";
    brokenLabel.prepend(broken);

    const controls = element("div", undefined, "controls");
    controls.append(tokenLabel, compareLabel, positionLabel, brokenLabel);
    const output = element("div", undefined, "panel");
    output.setAttribute("aria-live", "polite");

    const render = () => {
      const tokenId = Number(token.value);
      const compareId = Number(compare.value);
      const currentPosition = Number(position.value);
      const [embedding, comparison] = embeddingLookup(table, [tokenId, compareId]);
      if (!embedding || !comparison) return;
      const positioned = broken.checked
        ? embedding.map((value) => value + currentPosition)
        : rotatePairs(embedding, currentPosition);
      const rawNorm = Math.hypot(...embedding);
      const positionedNorm = Math.hypot(...positioned);
      output.innerHTML = `
        <p><strong>${vocabulary[tokenId]}</strong> at position <strong>${currentPosition}</strong></p>
        <table>
          <caption>Embedding lookup and positional transformation</caption>
          <thead><tr><th>representation</th><th>vector</th><th>L2 norm</th></tr></thead>
          <tbody>
            <tr><th>embedding row</th><td>${formatVector(embedding)}</td><td>${rawNorm.toFixed(3)}</td></tr>
            <tr><th>${broken.checked ? "scalar offset" : "RoPE-style pair rotation"}</th><td>${formatVector(positioned)}</td><td>${positionedNorm.toFixed(3)}</td></tr>
          </tbody>
        </table>
        <p><strong>Embedding cosine similarity:</strong> ${vocabulary[tokenId]} ↔ ${vocabulary[compareId]} = ${cosineSimilarity(embedding, comparison).toFixed(3)}</p>
        ${
          broken.checked
            ? '<p class="warning">Adding the position changes the vector norm and overwhelms token content as positions grow. Pair rotation preserves norm.</p>'
            : "<p>RoPE later rotates query and key coordinate pairs; this geometric preview shows how position changes direction without changing norm.</p>"
        }
      `;
      context.emit({
        type: "parameter-changed",
        payload: {
          token: vocabulary[tokenId] ?? "unknown",
          position: currentPosition,
          broken: broken.checked,
          rawNorm,
          positionedNorm,
        },
      });
    };

    const inputs = [token, compare, position, broken];
    inputs.forEach((control) => {
      control.addEventListener("input", render);
    });
    root.append(
      styles(),
      element("h2", "Look up a token, then rotate its coordinates"),
      element(
        "p",
        "The token chooses one learned table row. Position changes how coordinate pairs are interpreted.",
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
