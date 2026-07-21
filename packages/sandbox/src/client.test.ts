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
});
