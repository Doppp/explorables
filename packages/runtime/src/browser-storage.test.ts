import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readBrowserStorage,
  removeBrowserStorage,
  writeBrowserStorage,
} from "./browser-storage.ts";

afterEach(() => vi.unstubAllGlobals());

describe("browser storage", () => {
  it("reads, writes, and removes values", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });

    expect(writeBrowserStorage("course", "saved")).toBe(true);
    expect(readBrowserStorage("course")).toEqual({
      value: "saved",
      available: true,
    });
    expect(removeBrowserStorage("course")).toBe(true);
    expect(readBrowserStorage("course").value).toBeNull();
  });

  it("reports unavailable storage without throwing", () => {
    const unavailable = () => {
      throw new Error("Storage disabled");
    };
    vi.stubGlobal("window", {
      localStorage: {
        getItem: unavailable,
        setItem: unavailable,
        removeItem: unavailable,
      },
    });

    expect(readBrowserStorage("course")).toEqual({
      value: null,
      available: false,
    });
    expect(writeBrowserStorage("course", "saved")).toBe(false);
    expect(removeBrowserStorage("course")).toBe(false);
  });
});
