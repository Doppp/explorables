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
    .controls { display:flex; flex-wrap:wrap; gap:.75rem 1rem; align-items:end; }
    label { display:grid; gap:.3rem; color:var(--muted); font-size:.8rem; font-weight:700; }
    input, select, button { min-height:2.5rem; }
    input[type=number], input[type=text] { width:7rem; }
    input[type=range] { width:min(15rem, 65vw); }
    output { color:var(--text); font:700 .95rem ui-monospace, monospace; }
    table { display:block; width:100%; max-width:100%; margin-top:1rem; overflow:auto; border-collapse:collapse; font:.78rem ui-monospace, monospace; }
    th, td { padding:.45rem; border:1px solid var(--border); text-align:right; }
    th { background:var(--surface); }
    th:first-child, td:first-child { text-align:left; }
    .panel { margin-top:1rem; padding:.85rem; border:1px solid var(--border); border-radius:.45rem; background:var(--surface-tint); }
    .tokens { display:flex; flex-wrap:wrap; gap:.35rem; margin:.5rem 0; }
    .token { padding:.25rem .45rem; border:1px solid var(--border-strong); border-radius:.3rem; background:var(--surface); font:.78rem ui-monospace,monospace; }
    .warning { color:#8c3640; font-weight:700; }
    @media (prefers-color-scheme:dark) { .warning { color:#f1a3aa; } }
  `;
  return style;
}
