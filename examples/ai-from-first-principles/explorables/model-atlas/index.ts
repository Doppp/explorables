import type { ExplorableModule } from "@explorables/explorable";
import {
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { element, styles } from "../shared.ts";
import { initialTinyTransformer } from "../tiny-transformer/model.ts";
import { createTinyAtlasTrace } from "./model.ts";

const trace = createTinyAtlasTrace(initialTinyTransformer(), [0, 1, 2]);

const module: ExplorableModule = {
  mount(root, context) {
    const atlasStyles = element("style");
    atlasStyles.textContent = `
      .atlas-layout { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(16rem,1fr); gap:1rem; margin-top:1rem; }
      .atlas-viewport { position:relative; min-height:19rem; border:1px solid var(--border); border-radius:.55rem; overflow:hidden; background:linear-gradient(145deg,var(--surface),var(--surface-tint)); }
      .atlas-viewport canvas { display:block; width:100%; height:19rem; }
      .atlas-fallback { display:grid; min-height:19rem; place-content:center; padding:1rem; text-align:center; color:var(--muted); }
      .atlas-outline { display:grid; gap:.4rem; margin:0; padding:0; list-style:none; }
      .atlas-outline button { width:100%; min-height:2.8rem; padding:.45rem .6rem; border:1px solid var(--border); border-radius:.4rem; background:var(--surface); color:var(--text); text-align:left; }
      .atlas-outline button[aria-current=step] { border-color:var(--accent); box-shadow:inset .25rem 0 var(--accent); background:var(--surface-tint); }
      .atlas-meta { color:var(--muted); font-size:.8rem; }
      .atlas-inspector h3 { margin:.2rem 0; }
      .atlas-inspector table { margin-top:.65rem; }
      @media (max-width:700px) { .atlas-layout { grid-template-columns:1fr; } .atlas-viewport, .atlas-viewport canvas, .atlas-fallback { min-height:15rem; height:15rem; } }
    `;
    const viewport = element("div", undefined, "atlas-viewport");
    const outline = element("ol", undefined, "atlas-outline");
    outline.setAttribute("aria-label", "Model trace stages");
    const inspector = element("section", undefined, "panel atlas-inspector");
    inspector.setAttribute("aria-live", "polite");
    const layout = element("div", undefined, "atlas-layout");
    const right = element("div");
    right.append(outline, inspector);
    layout.append(viewport, right);

    const buttons: HTMLButtonElement[] = [];
    let selected = 0;
    let renderer: WebGLRenderer | undefined;
    let scene: Scene | undefined;
    let camera: PerspectiveCamera | undefined;
    const blocks: Array<Mesh<BoxGeometry, MeshStandardMaterial>> = [];
    let animationFrame: number | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const renderInspector = () => {
      const step = trace.steps[selected];
      if (!step) return;
      buttons.forEach((button, index) => {
        if (index === selected) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      const rows = step.values
        .map(
          (row, rowIndex) =>
            `<tr><th scope="row">${step.rowLabels[rowIndex] ?? `row ${rowIndex}`}</th>${row.map((value) => `<td>${value.toFixed(3)}</td>`).join("")}</tr>`,
        )
        .join("");
      inspector.innerHTML = `
        <p class="atlas-meta">Step ${selected + 1} of ${trace.steps.length} · ${step.evidence} evidence</p>
        <h3>${step.title}</h3>
        <p>${step.summary}</p>
        <table><caption>Exact values at ${step.title}</caption><thead><tr><th scope="col">Tensor row</th>${step.columnLabels.map((label) => `<th scope="col">${label}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
      `;
      blocks.forEach((block, index) => {
        block.material.color.set(index === selected ? 0xd98757 : 0x5c7f71);
        block.scale.setScalar(index === selected ? 1.16 : 1);
      });
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    trace.steps.forEach((step, index) => {
      const button = element("button", `${index + 1}. ${step.title}`);
      button.type = "button";
      const select = () => {
        selected = index;
        renderInspector();
        context.emit({
          type: "parameter-changed",
          payload: { stage: step.id, evidence: step.evidence },
        });
      };
      button.addEventListener("click", select);
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
          `${message} Use the synchronized model stages and exact tensor table beside this panel.`,
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
      scene.background = new Color(0xf7f3ea);
      camera = new PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 4.8, 11.5);
      camera.lookAt(0, 0, 0);
      const group = new Group();
      trace.steps.forEach((_, index) => {
        const geometry = new BoxGeometry(1.35, 1.1, 1.35);
        const material = new MeshStandardMaterial({ color: 0x5c7f71, roughness: 0.72 });
        const block = new Mesh(geometry, material);
        block.position.set((index - (trace.steps.length - 1) / 2) * 1.65, 0, 0);
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
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        showFallback("The 3D context became unavailable.");
      });
      resize();
    } catch {
      showFallback("3D rendering is unavailable in this browser.");
    }

    root.append(
      styles(),
      atlasStyles,
      element("h2", "Walk one prediction through the model"),
      element(
        "p",
        `Follow ${trace.tokens.join(" → ")} through the exact executable forward pass. The blocks aggregate operations; the table contains the real values.`,
      ),
      layout,
      element(
        "p",
        `Evidence: executable teaching model · source: ${trace.source}. The scene does not depict production-model scale.`,
        "atlas-meta",
      ),
    );
    renderInspector();

    return {
      destroy() {
        if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
        resizeObserver?.disconnect();
        blocks.forEach((block) => {
          block.geometry.dispose();
          block.material.dispose();
        });
        renderer?.dispose();
        root.replaceChildren();
      },
    };
  },
};

export default module;
