export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function numberInput(
  labelText: string,
  value: number,
  step = 0.1,
): [HTMLLabelElement, HTMLInputElement] {
  const label = element("label", labelText);
  const input = element("input");
  input.type = "number";
  input.value = String(value);
  input.step = String(step);
  label.append(input);
  return [label, input];
}

export function styles(): HTMLStyleElement {
  const style = element("style");
  style.textContent = `
    .controls { display:flex; flex-wrap:wrap; gap:.8rem; align-items:end; }
    label { display:grid; gap:.25rem; font-size:.78rem; font-weight:700; }
    input, select, button { min-height:2.2rem; }
    input[type=number], input[type=text] { width:7rem; padding:.35rem; }
    input[type=range] { width:min(15rem, 65vw); }
    button { padding:.35rem .7rem; cursor:pointer; }
    output { font:700 1rem ui-monospace, monospace; }
    table { width:100%; margin-top:1rem; border-collapse:collapse; font: .78rem ui-monospace, monospace; }
    th, td { padding:.4rem; border:1px solid color-mix(in srgb, CanvasText 22%, transparent); text-align:right; }
    th:first-child, td:first-child { text-align:left; }
    .panel { margin-top:1rem; padding:.8rem; border:1px solid color-mix(in srgb, CanvasText 22%, transparent); border-radius:.5rem; }
    .tokens { display:flex; flex-wrap:wrap; gap:.35rem; margin:.5rem 0; }
    .token { padding:.25rem .45rem; border:1px solid currentColor; border-radius:.3rem; font: .78rem ui-monospace,monospace; }
    .warning { color:#bd3434; font-weight:700; }
    @media (prefers-color-scheme:dark) { .warning { color:#ff8e8e; } }
  `;
  return style;
}
