// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mountForTest, type ExplorableModule } from "./index.ts";

describe("mountForTest", () => {
  it("collects local events and tears down", async () => {
    const module: ExplorableModule = {
      mount(root, context) {
        root.textContent = "mounted";
        context.emit({ type: "mounted", payload: { value: 1 } });
        context.recordExperiment({
          inputs: { rate: 0.2 },
          outputs: { loss: 1.5 },
        });
        return { destroy: () => root.replaceChildren() };
      },
    };
    const mounted = await mountForTest(module);
    expect(mounted.root.textContent).toBe("mounted");
    expect(mounted.events).toEqual([
      { type: "mounted", payload: { value: 1 } },
      {
        type: "experiment-recorded",
        payload: { inputs: { rate: 0.2 }, outputs: { loss: 1.5 } },
      },
    ]);
    mounted.destroy();
    expect(mounted.root.textContent).toBe("");
  });
});
