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

export function isLoopbackTutorHost(hostname: string): boolean {
  return ["127.0.0.1", "localhost", "::1"].includes(hostname);
}

export function publishTutorInteraction(interaction: TutorInteraction): void {
  if (!isLoopbackTutorHost(window.location.hostname)) return;
  void fetch("/__explorables/tutor-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(interaction),
    keepalive: true,
  }).catch(() => {
    // Static builds have no local tutor bridge. Browser learning remains independent.
  });
}
