import type { ExplorableContext, ExplorableHandle } from "@explorables/explorable";
import { compareModelDescriptors } from "./compare.ts";
import { mountModelAtlas } from "./renderer.ts";
import {
  type ModelAtlasDescriptor,
  type ModelAtlasTrace,
  parseModelAtlasDescriptor,
  parseModelAtlasTrace,
} from "./schema.ts";

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function mountModelAtlasComparison(
  root: HTMLElement,
  context: ExplorableContext,
  descriptorValues: unknown[],
  traceValues: unknown[] = [],
): ExplorableHandle {
  const descriptors = descriptorValues.map(parseModelAtlasDescriptor);
  if (descriptors.length < 2) {
    throw new RangeError("comparison mode needs at least two model descriptors");
  }
  const ids = new Set<string>();
  for (const descriptor of descriptors) {
    if (ids.has(descriptor.id))
      throw new RangeError(`duplicate model id ${descriptor.id}`);
    ids.add(descriptor.id);
  }
  const traces = new Map<string, ModelAtlasTrace>();
  for (const value of traceValues) {
    const trace = parseModelAtlasTrace(value);
    traces.set(trace.descriptorId, trace);
  }

  const style = element("style");
  style.textContent = `
    .atlas-compare-controls { display:flex; flex-wrap:wrap; gap:.75rem 1rem; align-items:end; }
    .atlas-compare-controls label { display:grid; gap:.3rem; color:var(--muted); font-size:.8rem; font-weight:700; }
    .atlas-compare-controls select, .atlas-compare-controls button { min-height:2.5rem; }
    .atlas-compare-table { display:block; width:100%; max-width:100%; margin:1rem 0; overflow:auto; border-collapse:collapse; font:.82rem ui-monospace,monospace; }
    .atlas-compare-table th, .atlas-compare-table td { padding:.5rem; border:1px solid var(--border); text-align:left; }
    .atlas-compare-table th { background:var(--surface); }
  `;
  const leftLabel = element("label", "Model shown in the atlas");
  const leftSelect = element("select");
  const rightLabel = element("label", "Compare with");
  const rightSelect = element("select");
  for (const descriptor of descriptors) {
    for (const select of [leftSelect, rightSelect]) {
      const option = element("option", descriptor.name);
      option.value = descriptor.id;
      select.append(option);
    }
  }
  rightSelect.selectedIndex = 1;
  leftLabel.append(leftSelect);
  rightLabel.append(rightSelect);
  const swap = element("button", "Swap models");
  swap.type = "button";
  const controls = element("div");
  controls.className = "atlas-compare-controls";
  controls.append(leftLabel, rightLabel, swap);
  const comparison = element("div");
  comparison.setAttribute("aria-live", "polite");
  const atlasRoot = element("div");
  root.append(style, controls, comparison, atlasRoot);

  let atlasHandle: ExplorableHandle | undefined;
  const selectedDescriptor = (select: HTMLSelectElement): ModelAtlasDescriptor => {
    const descriptor = descriptors.find((item) => item.id === select.value);
    if (!descriptor) throw new RangeError(`unknown selected model ${select.value}`);
    return descriptor;
  };
  const render = () => {
    const left = selectedDescriptor(leftSelect);
    const right = selectedDescriptor(rightSelect);
    const heading = element("h2", `${left.name} compared with ${right.name}`);
    const table = element("table");
    table.className = "atlas-compare-table";
    const caption = element(
      "caption",
      "Only source-grounded fields are compared; missing values remain undisclosed.",
    );
    const head = element("thead");
    const headRow = element("tr");
    for (const text of ["Published field", left.name, right.name, "Relationship"]) {
      const cell = element("th", text);
      cell.scope = "col";
      headRow.append(cell);
    }
    head.append(headRow);
    const body = element("tbody");
    for (const row of compareModelDescriptors(left, right)) {
      const tableRow = element("tr");
      const label = element("th", row.label);
      label.scope = "row";
      tableRow.append(
        label,
        element("td", row.left),
        element("td", row.right),
        element("td", row.relation),
      );
      body.append(tableRow);
    }
    table.append(caption, head, body);
    comparison.replaceChildren(heading, table);
    atlasHandle?.destroy?.();
    atlasRoot.replaceChildren();
    const trace = traces.get(left.id) ?? {
      descriptorId: left.id,
      traceId: "architecture-only",
      tokens: [],
      steps: [],
    };
    atlasHandle = mountModelAtlas(atlasRoot, context, left, trace);
    context.emit({
      type: "comparison-changed",
      payload: { left: left.id, right: right.id },
    });
  };
  const onChange = () => render();
  const onSwap = () => {
    const previous = leftSelect.value;
    leftSelect.value = rightSelect.value;
    rightSelect.value = previous;
    render();
  };
  leftSelect.addEventListener("change", onChange);
  rightSelect.addEventListener("change", onChange);
  swap.addEventListener("click", onSwap);
  render();

  return {
    destroy() {
      leftSelect.removeEventListener("change", onChange);
      rightSelect.removeEventListener("change", onChange);
      swap.removeEventListener("click", onSwap);
      atlasHandle?.destroy?.();
      root.replaceChildren();
    },
  };
}
