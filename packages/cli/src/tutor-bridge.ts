import type { IncomingMessage, ServerResponse } from "node:http";

export const TUTOR_EVENTS_PATH = "/__explorables/tutor-events";
const MAX_EVENT_BYTES = 8_192;
const MAX_BUFFERED_EVENTS = 50;

export interface TutorInteraction {
  schemaVersion: 1;
  type:
    | "checkpoint-completed"
    | "checkpoint-restarted"
    | "lesson-opened"
    | "lesson-skipped"
    | "mode-changed";
  courseId: string;
  courseVersion: string;
  lessonId: string;
  lessonTitle: string;
  checkpointId?: string;
  checkpointTitle?: string;
  response?: string;
  source?: "learner" | "explorable";
  mode?: "guided" | "explore";
}

export interface TutorEventEnvelope {
  id: number;
  occurredAt: string;
  interaction: TutorInteraction;
}

function boundedString(value: unknown, maximum = 200): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

export function isTutorInteraction(value: unknown): value is TutorInteraction {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<TutorInteraction>;
  return (
    event.schemaVersion === 1 &&
    [
      "checkpoint-completed",
      "checkpoint-restarted",
      "lesson-opened",
      "lesson-skipped",
      "mode-changed",
    ].includes(event.type ?? "") &&
    boundedString(event.courseId) &&
    boundedString(event.courseVersion) &&
    boundedString(event.lessonId) &&
    boundedString(event.lessonTitle) &&
    (event.checkpointId === undefined || boundedString(event.checkpointId)) &&
    (event.checkpointTitle === undefined || boundedString(event.checkpointTitle)) &&
    (event.response === undefined || boundedString(event.response, 4_000)) &&
    (event.mode === undefined || event.mode === "guided" || event.mode === "explore") &&
    (event.source === undefined ||
      event.source === "learner" ||
      event.source === "explorable")
  );
}

function writeSse(response: ServerResponse, envelope: TutorEventEnvelope): void {
  response.write(`id: ${envelope.id}\n`);
  response.write("event: course-interaction\n");
  response.write(`data: ${JSON.stringify(envelope)}\n\n`);
}

export function createTutorEventBridge() {
  let nextId = 1;
  const buffered: TutorEventEnvelope[] = [];
  const listeners = new Set<ServerResponse>();
  let lastFingerprint = "";
  let lastPublishedAt = 0;

  const publish = (interaction: TutorInteraction): TutorEventEnvelope => {
    const fingerprint = JSON.stringify(interaction);
    const publishedAt = Date.now();
    const prior = buffered.at(-1);
    if (prior && fingerprint === lastFingerprint && publishedAt - lastPublishedAt < 500)
      return prior;
    const envelope = {
      id: nextId++,
      occurredAt: new Date().toISOString(),
      interaction,
    };
    lastFingerprint = fingerprint;
    lastPublishedAt = publishedAt;
    buffered.push(envelope);
    if (buffered.length > MAX_BUFFERED_EVENTS) buffered.shift();
    for (const listener of listeners) writeSse(listener, envelope);
    return envelope;
  };

  const handle = async (
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<boolean> => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (url.pathname !== TUTOR_EVENTS_PATH) return false;

    if (request.method === "GET") {
      const after = Number(
        url.searchParams.get("after") ?? request.headers["last-event-id"] ?? 0,
      );
      response.writeHead(200, {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      });
      response.write('event: ready\ndata: {"status":"listening"}\n\n');
      for (const envelope of buffered) {
        if (!Number.isFinite(after) || envelope.id > after)
          writeSse(response, envelope);
      }
      listeners.add(response);
      request.once("close", () => listeners.delete(response));
      return true;
    }

    if (request.method !== "POST") {
      response.writeHead(405, { Allow: "GET, POST" });
      response.end("Method not allowed");
      return true;
    }

    let body = "";
    for await (const chunk of request) {
      body += String(chunk);
      if (Buffer.byteLength(body) > MAX_EVENT_BYTES) {
        response.writeHead(413);
        response.end("Event too large");
        return true;
      }
    }
    let value: unknown;
    try {
      value = JSON.parse(body);
    } catch {
      response.writeHead(400);
      response.end("Invalid JSON");
      return true;
    }
    if (!isTutorInteraction(value)) {
      response.writeHead(400);
      response.end("Invalid tutor event");
      return true;
    }
    const envelope = publish(value);
    response.writeHead(202, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ id: envelope.id, listeners: listeners.size }));
    return true;
  };

  const close = () => {
    for (const listener of listeners) listener.end();
    listeners.clear();
  };

  return { handle, close, publish };
}

export async function monitorTutorEvents(
  baseUrl = "http://127.0.0.1:4173",
): Promise<void> {
  const endpoint = new URL(TUTOR_EVENTS_PATH, baseUrl);
  if (
    endpoint.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "::1"].includes(endpoint.hostname)
  )
    throw new Error("Tutor events may only be read from a loopback HTTP URL.");
  const response = await fetch(endpoint);
  if (!response.ok || !response.body)
    throw new Error(`Tutor event stream failed (${response.status}) at ${endpoint}`);

  console.log(`Listening for course interactions at ${endpoint}`);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let pending = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    pending += value;
    const frames = pending.split("\n\n");
    pending = frames.pop() ?? "";
    for (const frame of frames) {
      if (!frame.includes("event: course-interaction")) continue;
      const data = frame
        .split("\n")
        .find((line) => line.startsWith("data: "))
        ?.slice(6);
      if (data) console.log(`[course-interaction] ${data}`);
    }
  }
}
