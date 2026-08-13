// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  isSandboxMessage,
  mountSandbox,
  SANDBOX_ATTRIBUTE,
  SANDBOX_CSP,
} from "./index.ts";

describe("sandbox boundary", () => {
  it("denies same-origin and network access", () => {
    expect(SANDBOX_ATTRIBUTE).toBe("allow-scripts");
    expect(SANDBOX_CSP).toContain("connect-src 'none'");
    expect(SANDBOX_CSP).toContain("default-src 'none'");
  });

  it("validates protocol messages", () => {
    expect(
      isSandboxMessage({
        protocol: "explorables/v1",
        instanceId: "one",
        type: "ready",
      }),
    ).toBe(true);
    expect(
      isSandboxMessage({ protocol: "wrong", instanceId: "one", type: "ready" }),
    ).toBe(false);
  });

  it("creates and removes a restricted iframe", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const onError = vi.fn();
    const controller = mountSandbox(host, {
      instanceId: "one",
      title: "Demo",
      height: 320,
      html: '<!doctype html><html lang="en"><title>demo</title></html>',
      theme: "light",
      onError,
    });
    const iframe = controller.iframe;
    expect(controller.iframe.getAttribute("sandbox")).toBe("allow-scripts");
    expect(controller.iframe.srcdoc).toContain("demo");
    expect(controller.iframe.srcdoc).toContain('data-theme="light"');

    controller.setTheme("dark");
    expect(controller.iframe).toBe(iframe);
    expect(iframe.style.colorScheme).toBe("dark");
    expect(host.querySelectorAll("iframe")).toHaveLength(1);

    controller.destroy();
    expect(host.querySelector("iframe")).toBeNull();
    host.remove();
  });
});
