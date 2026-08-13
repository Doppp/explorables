// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mountSandbox } from "./client.ts";

describe("sandbox client error isolation", () => {
  it("reports an iframe error without replacing its host or sibling content", () => {
    const parent = document.createElement("div");
    const host = document.createElement("section");
    const sibling = document.createElement("p");
    sibling.textContent = "Course navigation remains alive";
    parent.append(host, sibling);
    const onError = vi.fn();
    const controller = mountSandbox(host, {
      instanceId: "broken",
      title: "Broken fixture",
      height: 200,
      html: "<!doctype html>",
      theme: "light",
      onError,
    });
    window.dispatchEvent(
      new MessageEvent("message", {
        source: controller.iframe.contentWindow,
        data: {
          protocol: "explorables/v1",
          instanceId: "broken",
          type: "error",
          message: "intentional failure",
        },
      }),
    );
    expect(onError).toHaveBeenCalledWith("intentional failure");
    expect(sibling.textContent).toContain("remains alive");
    controller.destroy();
  });

  it("applies the initial theme and updates it without replacing the iframe", () => {
    const host = document.createElement("section");
    document.body.append(host);
    const controller = mountSandbox(host, {
      instanceId: "themed",
      title: "Themed fixture",
      height: 200,
      html: '<!doctype html><html lang="en"><body></body></html>',
      theme: "dark",
    });
    const iframe = controller.iframe;
    const contentWindow = iframe.contentWindow;
    if (!contentWindow) throw new Error("Expected the mounted iframe to have a window");
    const postMessage = vi.spyOn(contentWindow, "postMessage");

    expect(iframe.srcdoc).toContain('data-theme="dark"');
    expect(iframe.style.colorScheme).toBe("dark");

    window.dispatchEvent(
      new MessageEvent("message", {
        source: contentWindow,
        data: {
          protocol: "explorables/v1",
          instanceId: "themed",
          type: "ready",
        },
      }),
    );
    expect(postMessage).toHaveBeenLastCalledWith(
      {
        protocol: "explorables/v1",
        instanceId: "themed",
        type: "theme",
        theme: "dark",
      },
      "*",
    );

    controller.setTheme("light");
    expect(controller.iframe).toBe(iframe);
    expect(host.querySelectorAll("iframe")).toHaveLength(1);
    expect(iframe.style.colorScheme).toBe("light");
    expect(postMessage).toHaveBeenLastCalledWith(
      {
        protocol: "explorables/v1",
        instanceId: "themed",
        type: "theme",
        theme: "light",
      },
      "*",
    );

    controller.destroy();
    host.remove();
  });
});
