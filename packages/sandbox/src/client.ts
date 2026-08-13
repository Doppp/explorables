import type { ExplorableEvent } from "@explorables/explorable";

export const SANDBOX_ATTRIBUTE = "allow-scripts";

export type Theme = "light" | "dark";

export interface SandboxMessage {
  protocol: "explorables/v1";
  instanceId: string;
  type: "ready" | "event" | "error";
  event?: ExplorableEvent;
  message?: string;
  stack?: string;
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
