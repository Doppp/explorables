import fs from "node:fs/promises";
import path from "node:path";
import type { ExplorableEvent, ExplorableValue } from "@explorables/explorable";

export const SANDBOX_ATTRIBUTE = "allow-scripts";
export const SANDBOX_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' blob:",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "connect-src 'none'",
  "media-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

export interface BundleExplorableOptions {
  courseRoot: string;
  entry: string;
  instanceId: string;
  lessonId: string;
  config?: ExplorableValue;
}

export interface SandboxMessage {
  protocol: "explorables/v1";
  instanceId: string;
  type: "ready" | "event" | "error";
  event?: ExplorableEvent;
  message?: string;
  stack?: string;
}

function escapeScript(source: string): string {
  return source.replaceAll("</script", "<\\/script");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function bundleExplorable(
  options: BundleExplorableOptions,
): Promise<string> {
  const { build } = await import("esbuild");
  const entry = path.resolve(options.entry);
  const relative = path.relative(options.courseRoot, entry);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Explorable entry escapes course root: ${options.entry}`);
  }
  await fs.access(entry);

  const wrapper = `
    import explorable from ${JSON.stringify(entry)};
    const protocol = "explorables/v1";
    const instanceId = ${JSON.stringify(options.instanceId)};
    const lessonId = ${JSON.stringify(options.lessonId)};
    const config = ${JSON.stringify(options.config ?? null)};
    const send = (message) => parent.postMessage({ protocol, instanceId, ...message }, "*");
    const root = document.getElementById("explorable-root");
    let handle;
    const report = (error) => send({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    addEventListener("error", (event) => report(event.error ?? event.message));
    addEventListener("unhandledrejection", (event) => report(event.reason));
    addEventListener("message", (event) => {
      const message = event.data;
      if (!message || message.protocol !== protocol || message.instanceId !== instanceId) return;
      if (message.type === "resize") handle?.resize?.(message.width, message.height);
      if (message.type === "destroy") {
        handle?.destroy?.();
        root.replaceChildren();
      }
    });
    Promise.resolve(explorable.mount(root, {
      instanceId,
      lessonId,
      config,
      emit: (event) => send({ type: "event", event }),
    })).then((result) => {
      handle = result ?? {};
      send({ type: "ready" });
    }).catch(report);
  `;

  const result = await build({
    stdin: {
      contents: wrapper,
      loader: "ts",
      resolveDir: path.dirname(entry),
      sourcefile: `${entry}.sandbox.ts`,
    },
    absWorkingDir: options.courseRoot,
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    sourcemap: "inline",
    outfile: "sandbox.js",
    write: false,
    logLevel: "silent",
  });
  const script = result.outputFiles.find((file) => file.path.endsWith(".js"))?.text;
  const style =
    result.outputFiles.find((file) => file.path.endsWith(".css"))?.text ?? "";
  if (!script) throw new Error(`No JavaScript was produced for ${entry}`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(SANDBOX_CSP)}">
  <style>
    :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 1rem; background: Canvas; color: CanvasText; }
    button, input, select { font: inherit; }
    :focus-visible { outline: 3px solid #7c5cff; outline-offset: 2px; }
    ${style}
  </style>
</head>
<body><main id="explorable-root" aria-live="polite"></main><script>${escapeScript(script)}</script></body>
</html>`;
}

export function isSandboxMessage(value: unknown): value is SandboxMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<SandboxMessage>;
  return (
    message.protocol === "explorables/v1" &&
    typeof message.instanceId === "string" &&
    (message.type === "ready" || message.type === "event" || message.type === "error")
  );
}

export interface SandboxControllerOptions {
  instanceId: string;
  title: string;
  height: number;
  html: string;
  onEvent?: (event: ExplorableEvent) => void;
  onError?: (message: string) => void;
}

export interface SandboxController {
  iframe: HTMLIFrameElement;
  destroy(): void;
  resize(width: number, height: number): void;
}

export function mountSandbox(
  container: HTMLElement,
  options: SandboxControllerOptions,
): SandboxController {
  const iframe = document.createElement("iframe");
  iframe.title = options.title;
  iframe.height = String(options.height);
  iframe.setAttribute("sandbox", SANDBOX_ATTRIBUTE);
  iframe.setAttribute("referrerpolicy", "no-referrer");
  iframe.setAttribute("loading", "lazy");
  iframe.srcdoc = options.html;

  const listener = (event: MessageEvent<unknown>) => {
    if (event.source !== iframe.contentWindow || !isSandboxMessage(event.data)) return;
    if (event.data.instanceId !== options.instanceId) return;
    if (event.data.type === "event" && event.data.event)
      options.onEvent?.(event.data.event);
    if (event.data.type === "error")
      options.onError?.(event.data.message ?? "Unknown error");
  };
  window.addEventListener("message", listener);
  container.prepend(iframe);

  return {
    iframe,
    resize(width, height) {
      iframe.contentWindow?.postMessage(
        {
          protocol: "explorables/v1",
          instanceId: options.instanceId,
          type: "resize",
          width,
          height,
        },
        "*",
      );
    },
    destroy() {
      iframe.contentWindow?.postMessage(
        { protocol: "explorables/v1", instanceId: options.instanceId, type: "destroy" },
        "*",
      );
      window.removeEventListener("message", listener);
      iframe.remove();
    },
  };
}
