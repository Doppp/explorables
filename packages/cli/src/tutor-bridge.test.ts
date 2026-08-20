import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import {
  createTutorEventBridge,
  isTutorInteraction,
  monitorTutorEvents,
  TUTOR_EVENTS_PATH,
} from "./tutor-bridge.ts";

const interaction = {
  schemaVersion: 1 as const,
  type: "checkpoint-completed" as const,
  courseId: "demo-course",
  courseVersion: "1.0.0",
  lessonId: "foundations",
  lessonTitle: "Foundations",
  checkpointId: "classify",
  checkpointTitle: "Classify a system",
  source: "explorable" as const,
};

describe("tutor event bridge", () => {
  const closers: Array<() => void> = [];
  afterEach(() => {
    while (closers.length) closers.pop()?.();
  });

  it("accepts only bounded semantic interactions", () => {
    expect(isTutorInteraction(interaction)).toBe(true);
    expect(isTutorInteraction({ ...interaction, response: "x".repeat(4_001) })).toBe(
      false,
    );
    expect(isTutorInteraction({ ...interaction, type: "mouse-moved" })).toBe(false);
  });

  it("refuses non-loopback listener URLs", async () => {
    await expect(monitorTutorEvents("https://courses.example.com")).rejects.toThrow(
      "loopback HTTP URL",
    );
  });

  it("forwards browser interactions to a local SSE listener", async () => {
    const bridge = createTutorEventBridge();
    const server = createServer(async (request, response) => {
      if (!(await bridge.handle(request, response))) {
        response.writeHead(404);
        response.end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    closers.push(() => {
      bridge.close();
      server.close();
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing test port");
    const endpoint = `http://127.0.0.1:${address.port}${TUTOR_EVENTS_PATH}`;
    const stream = await fetch(endpoint);
    const reader = stream.body?.getReader();
    if (!reader) throw new Error("Missing event stream");
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toContain("event: ready");

    const published = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interaction),
    });
    expect(published.status).toBe(202);
    let text = "";
    while (!text.includes("\n\n")) {
      const next = await reader.read();
      text += new TextDecoder().decode(next.value);
    }
    expect(text).toContain("event: course-interaction");
    expect(text).toContain('"checkpointId":"classify"');

    const malformed = await fetch(endpoint, { method: "POST", body: "{}" });
    expect(malformed.status).toBe(400);
    const oversized = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ ...interaction, response: "x".repeat(9_000) }),
    });
    expect(oversized.status).toBe(413);
    await reader.cancel();
  });
});
