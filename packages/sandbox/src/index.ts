import fs from "node:fs/promises";
import path from "node:path";
import type { ExplorableEvent, ExplorableValue } from "@explorables/explorable";

export const SANDBOX_ATTRIBUTE = "allow-scripts";
export type Theme = "light" | "dark";
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
      if (message.type === "theme" && (message.theme === "light" || message.theme === "dark")) {
        document.documentElement.dataset.theme = message.theme;
      }
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
      recordExperiment: (record) => send({
        type: "event",
        event: { type: "experiment-recorded", payload: record },
      }),
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
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(SANDBOX_CSP)}">
  <style>
    :root[data-theme="light"] {
      color-scheme: light;
      font-family: "Avenir Next", Avenir, "Segoe UI", ui-sans-serif, system-ui, sans-serif;
      --canvas: #fffdf8;
      --surface: #f7f3ea;
      --surface-tint: #e8efe5;
      --text: #26312b;
      --muted: #5d665f;
      --accent: #365b4b;
      --accent-hover: #29483b;
      --on-accent: #fffdf8;
      --focus: #1e5aa8;
      --border: #cfcbbf;
      --border-strong: #7a7b75;
    }
    :root[data-theme="dark"] {
      color-scheme: dark;
      --canvas: #20262c;
      --surface: #171b20;
      --surface-tint: #25372f;
      --text: #f3f1ea;
      --muted: #bdc5bf;
      --accent: #b4d9c3;
      --accent-hover: #cde6d6;
      --on-accent: #17362a;
      --focus: #9bc5ff;
      --border: #465049;
      --border-strong: #78847c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: .85rem;
      background: var(--canvas);
      color: var(--text);
      line-height: 1.55;
    }
    h1, h2, h3 {
      font-family: ui-serif, "Iowan Old Style", "Palatino Linotype", Georgia, serif;
      line-height: 1.2;
    }
    h2:first-child, h3:first-child { margin-top: 0; }
    button, input, select, textarea { font: inherit; }
    button {
      min-height: 2.5rem;
      padding: .45rem .75rem;
      border: 1px solid var(--accent);
      border-radius: .35rem;
      background: var(--accent);
      color: var(--on-accent);
      cursor: pointer;
      font-weight: 700;
    }
    button:hover:not(:disabled) { background: var(--accent-hover); }
    button:disabled { cursor: not-allowed; opacity: .55; }
    input[type="number"], input[type="text"], select, textarea {
      min-height: 2.5rem;
      padding: .4rem .5rem;
      border: 1px solid var(--border-strong);
      border-radius: .35rem;
      background: var(--surface);
      color: var(--text);
    }
    input[type="range"], input[type="checkbox"], input[type="radio"] {
      accent-color: var(--accent);
    }
    :focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
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

function withInitialTheme(html: string, theme: Theme): string {
  return html.replace(/<html\b[^>]*>/i, (tag) => {
    const themeAttribute = /\sdata-theme=(?:"[^"]*"|'[^']*'|[^\s>]*)/i;
    return themeAttribute.test(tag)
      ? tag.replace(themeAttribute, ` data-theme="${theme}"`)
      : tag.replace(/>$/, ` data-theme="${theme}">`);
  });
}

export interface SandboxControllerOptions {
  instanceId: string;
  title: string;
  height: number;
  html: string;
  theme: Theme;
  onEvent?: (event: ExplorableEvent) => void;
  onError?: (message: string) => void;
}

export interface SandboxController {
  iframe: HTMLIFrameElement;
  destroy(): void;
  resize(width: number, height: number): void;
  setTheme(theme: Theme): void;
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
  iframe.style.colorScheme = options.theme;
  iframe.srcdoc = withInitialTheme(options.html, options.theme);

  let theme = options.theme;
  const postTheme = () => {
    iframe.contentWindow?.postMessage(
      {
        protocol: "explorables/v1",
        instanceId: options.instanceId,
        type: "theme",
        theme,
      },
      "*",
    );
  };

  const listener = (event: MessageEvent<unknown>) => {
    if (event.source !== iframe.contentWindow || !isSandboxMessage(event.data)) return;
    if (event.data.instanceId !== options.instanceId) return;
    if (event.data.type === "ready") postTheme();
    if (event.data.type === "event" && event.data.event)
      options.onEvent?.(event.data.event);
    if (event.data.type === "error")
      options.onError?.(event.data.message ?? "Unknown error");
  };
  window.addEventListener("message", listener);
  container.prepend(iframe);

  return {
    iframe,
    setTheme(nextTheme) {
      theme = nextTheme;
      iframe.style.colorScheme = nextTheme;
      postTheme();
    },
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
