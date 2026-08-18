import type { ExplorableContext, ExplorableHandle } from "@explorables/explorable";
import {
  BoxGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import {
  type ModelAtlasDescriptor,
  type ModelAtlasTrace,
  parseModelAtlasDescriptor,
  parseModelAtlasTrace,
} from "./schema.ts";

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function validateTraceLinks(
  descriptor: ModelAtlasDescriptor,
  trace: ModelAtlasTrace,
): void {
  if (trace.descriptorId !== descriptor.id) {
    throw new RangeError(
      `trace descriptor ${trace.descriptorId} does not match ${descriptor.id}`,
    );
  }
  const stageIds = new Set(descriptor.stages.map((stage) => stage.id));
  for (const step of trace.steps) {
    if (!stageIds.has(step.stageId)) {
      throw new RangeError(`trace references unknown stage ${step.stageId}`);
    }
    if (step.rowLabels.length !== step.values.length) {
      throw new RangeError(`${step.stageId} needs one label per tensor row`);
    }
    if (step.values.some((row) => row.length !== step.columnLabels.length)) {
      throw new RangeError(`${step.stageId} tensor rows must have equal width`);
    }
  }
}

function appendTensorTable(
  parent: HTMLElement,
  stageTitle: string,
  step: ModelAtlasTrace["steps"][number] | undefined,
): void {
  if (!step) {
    parent.append(
      element(
        "p",
        "This architecture stage has no executable tensor trace. Its evidence and source remain available above.",
        "atlas-empty",
      ),
    );
    return;
  }
  const table = element("table");
  const caption = element("caption", `Exact values at ${stageTitle}`);
  const head = element("thead");
  const headRow = element("tr");
  const rowHeading = element("th", "Tensor row");
  rowHeading.scope = "col";
  headRow.append(rowHeading);
  for (const label of step.columnLabels) {
    const heading = element("th", label);
    heading.scope = "col";
    headRow.append(heading);
  }
  head.append(headRow);
  const body = element("tbody");
  step.values.forEach((row, rowIndex) => {
    const tableRow = element("tr");
    const heading = element("th", step.rowLabels[rowIndex] ?? `row ${rowIndex}`);
    heading.scope = "row";
    tableRow.append(heading);
    for (const value of row) tableRow.append(element("td", value.toFixed(3)));
    body.append(tableRow);
  });
  table.append(caption, head, body);
  parent.append(table);
}

export function mountModelAtlas(
  root: HTMLElement,
  context: ExplorableContext,
  descriptorValue: unknown,
  traceValue: unknown,
): ExplorableHandle {
  const descriptor = parseModelAtlasDescriptor(descriptorValue);
  const trace = parseModelAtlasTrace(traceValue);
  validateTraceLinks(descriptor, trace);

  const style = element("style");
  style.textContent = `
    .atlas-layout { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(16rem,1fr); gap:1rem; margin-top:1rem; }
    .atlas-viewport { position:relative; min-height:19rem; border:1px solid var(--border); border-radius:.55rem; overflow:hidden; background:linear-gradient(145deg,var(--surface),var(--surface-tint)); }
    .atlas-viewport canvas { display:block; width:100%; height:19rem; }
    .atlas-fallback { display:grid; min-height:19rem; place-content:center; padding:1rem; text-align:center; color:var(--muted); }
    .atlas-outline { display:grid; gap:.4rem; margin:0; padding:0; list-style:none; }
    .atlas-outline button { width:100%; min-height:2.8rem; padding:.45rem .6rem; border:1px solid var(--border); border-radius:.4rem; background:var(--surface); color:var(--text); text-align:left; }
    .atlas-outline button[aria-current=step] { border-color:var(--accent); box-shadow:inset .25rem 0 var(--accent); background:var(--surface-tint); }
    .atlas-meta, .atlas-empty { color:var(--muted); font-size:.8rem; }
    .atlas-inspector { margin-top:1rem; padding:.85rem; border:1px solid var(--border); border-radius:.45rem; background:var(--surface-tint); }
    .atlas-inspector h3 { margin:.2rem 0; }
    .atlas-inspector table { display:block; width:100%; max-width:100%; margin-top:.65rem; overflow:auto; border-collapse:collapse; font:.78rem ui-monospace,monospace; }
    .atlas-inspector th, .atlas-inspector td { padding:.45rem; border:1px solid var(--border); text-align:right; }
    .atlas-inspector th { background:var(--surface); }
    .atlas-inspector th:first-child, .atlas-inspector td:first-child { text-align:left; }
    @media (max-width:700px) { .atlas-layout { grid-template-columns:1fr; } .atlas-viewport, .atlas-viewport canvas, .atlas-fallback { min-height:15rem; height:15rem; } }
  `;
  const heading = element("h2", descriptor.name);
  const introduction = element(
    "p",
    `${descriptor.summary} Follow ${trace.tokens.join(" → ")} through the selected trace.`,
  );
  const viewport = element("div", undefined, "atlas-viewport");
  const outline = element("ol", undefined, "atlas-outline");
  outline.setAttribute("aria-label", "Model stages");
  const inspector = element("section", undefined, "atlas-inspector");
  inspector.setAttribute("aria-live", "polite");
  const layout = element("div", undefined, "atlas-layout");
  const right = element("div");
  right.append(outline, inspector);
  layout.append(viewport, right);

  const buttons: HTMLButtonElement[] = [];
  const listeners: Array<() => void> = [];
  let selected = 0;
  let renderer: WebGLRenderer | undefined;
  let scene: Scene | undefined;
  let camera: PerspectiveCamera | undefined;
  const blocks: Array<Mesh<BoxGeometry, MeshStandardMaterial>> = [];
  let animationFrame: number | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const renderInspector = () => {
    const stage = descriptor.stages[selected];
    if (!stage) return;
    buttons.forEach((button, index) => {
      if (index === selected) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    const sources = stage.sourceIds
      .map((sourceId) => descriptor.sources.find((source) => source.id === sourceId))
      .filter((source) => source !== undefined);
    const meta = element(
      "p",
      `Stage ${selected + 1} of ${descriptor.stages.length} · ${stage.evidence} evidence`,
      "atlas-meta",
    );
    const title = element("h3", stage.title);
    const summary = element("p", stage.summary);
    const sourceText = element(
      "p",
      `Source: ${sources.map((source) => source.label).join(", ")}`,
      "atlas-meta",
    );
    inspector.replaceChildren(meta, title, summary, sourceText);
    appendTensorTable(
      inspector,
      stage.title,
      trace.steps.find((step) => step.stageId === stage.id),
    );
    blocks.forEach((block, index) => {
      block.material.color.set(index === selected ? 0xd98757 : 0x5c7f71);
      block.scale.setScalar(index === selected ? 1.16 : 1);
    });
    if (renderer && scene && camera) renderer.render(scene, camera);
  };

  descriptor.stages.forEach((stage, index) => {
    const button = element("button", `${index + 1}. ${stage.title}`);
    button.type = "button";
    const select = () => {
      selected = index;
      renderInspector();
      context.emit({
        type: "parameter-changed",
        payload: { stage: stage.id, evidence: stage.evidence },
      });
    };
    button.addEventListener("click", select);
    listeners.push(() => button.removeEventListener("click", select));
    buttons.push(button);
    const item = element("li");
    item.append(button);
    outline.append(item);
  });

  const showFallback = (message: string) => {
    renderer?.dispose();
    renderer = undefined;
    scene = undefined;
    camera = undefined;
    viewport.replaceChildren(
      element(
        "p",
        `${message} Use the synchronized model stages and tensor table beside this panel.`,
        "atlas-fallback",
      ),
    );
  };

  try {
    const canvas = element("canvas");
    canvas.setAttribute("aria-hidden", "true");
    viewport.append(canvas);
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    scene = new Scene();
    camera = new PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 4.8, 11.5);
    camera.lookAt(0, 0, 0);
    const group = new Group();
    descriptor.stages.forEach((_, index) => {
      const geometry = new BoxGeometry(1.35, 1.1, 1.35);
      const material = new MeshStandardMaterial({
        color: 0x5c7f71,
        roughness: 0.72,
      });
      const block = new Mesh(geometry, material);
      block.position.set(
        (index - (descriptor.stages.length - 1) / 2) *
          Math.min(1.65, 8 / descriptor.stages.length),
        0,
        0,
      );
      group.add(block);
      blocks.push(block);
    });
    scene.add(group);
    const light = new DirectionalLight(0xffffff, 2.5);
    light.position.set(3, 6, 7);
    scene.add(light);
    const resize = () => {
      if (!renderer || !camera) return;
      const width = Math.max(viewport.clientWidth, 1);
      const height = Math.max(viewport.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (scene) renderer.render(scene, camera);
    };
    resizeObserver = new ResizeObserver(() => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(resize);
    });
    resizeObserver.observe(viewport);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      showFallback("The 3D context became unavailable.");
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    listeners.push(() => canvas.removeEventListener("webglcontextlost", onContextLost));
    resize();
  } catch {
    showFallback("3D rendering is unavailable in this browser.");
  }

  const provenance = element(
    "p",
    `Descriptor ${descriptor.id} · version ${descriptor.version}. 3D blocks aggregate operations; evidence labels and tensor tables carry the claim.`,
    "atlas-meta",
  );
  root.append(style, heading, introduction, layout, provenance);
  renderInspector();

  return {
    destroy() {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      listeners.forEach((remove) => {
        remove();
      });
      blocks.forEach((block) => {
        block.geometry.dispose();
        block.material.dispose();
      });
      renderer?.dispose();
      root.replaceChildren();
    },
  };
}
