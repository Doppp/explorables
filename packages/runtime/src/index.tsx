import type {
  Checkpoint,
  CourseSessionStateV1,
  ExperimentRecord,
  GuidedCourseStateV2,
  RuntimeCourse,
  RuntimeCourseCollection,
  RuntimeLesson,
} from "@explorables/course-schema";
import {
  mountSandbox,
  type SandboxController,
  type Theme,
} from "@explorables/sandbox/client";
import {
  type FormEvent,
  memo,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  readBrowserStorage,
  removeBrowserStorage,
  writeBrowserStorage,
} from "./browser-storage.ts";
import {
  courseSessionStorageKey,
  createCourseSessionState,
  parseCourseSessionState,
} from "./course-session.ts";
import { createExperimentRecord } from "./experiment-record.ts";
import {
  createGuidedState,
  guidedCourseReducer,
  guidedStorageKey,
  isLessonComplete,
  isLessonUnlocked,
  legacyGuidedStorageKey,
  parseGuidedState,
  restartGuidedStateFrom,
} from "./guided-state.ts";
import { lessonBodyHtml } from "./lesson-html.ts";
import { publishTutorInteraction } from "./tutor-events.ts";

const LessonArticle = memo(function LessonArticle({
  html,
  title,
}: {
  html: string;
  title: string;
}) {
  const sanitizedMarkup = { __html: lessonBodyHtml(html, title) };
  const articleRef = useRef<HTMLElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: changed HTML replaces the scroll regions that need keyboard access.
  useEffect(() => {
    for (const region of articleRef.current?.querySelectorAll("pre, table") ?? []) {
      if (region.scrollWidth > region.clientWidth) (region as HTMLElement).tabIndex = 0;
    }
  }, [html]);
  return (
    <article
      className="lesson-body"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the Markdown package sanitises this HTML before it enters runtime data.
      dangerouslySetInnerHTML={sanitizedMarkup}
      ref={articleRef}
    />
  );
});

const CourseIntroduction = memo(function CourseIntroduction({
  html,
  title,
}: {
  html: string;
  title: string;
}) {
  return (
    <div className="course-overview-body">
      <LessonArticle html={html} title={title} />
    </div>
  );
});

export const THEME_STORAGE_KEY = "explorables:theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function initialTheme(): Theme {
  const documentTheme = document.documentElement.dataset.theme;
  if (isTheme(documentTheme)) return documentTheme;
  const storedTheme = readBrowserStorage(THEME_STORAGE_KEY).value;
  if (isTheme(storedTheme)) return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystemTheme = (event: MediaQueryListEvent) => {
      if (!isTheme(readBrowserStorage(THEME_STORAGE_KEY).value))
        setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", followSystemTheme);
    return () => media.removeEventListener("change", followSystemTheme);
  }, []);

  return [
    theme,
    () => {
      setTheme((currentTheme) => {
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        writeBrowserStorage(THEME_STORAGE_KEY, nextTheme);
        return nextTheme;
      });
    },
  ];
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-pressed={theme === "dark"}
      onClick={onToggle}
    >
      <span className="theme-toggle-label">Dark mode</span>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}

function useCompactNavigation(): boolean {
  const query = "(max-width: 62rem)";
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return compact;
}

function hashLessonId(first: string, routePrefix = "", preferred = first): string {
  const route = window.location.hash.replace(/^#\/?/, "");
  if (!routePrefix) return route || preferred;
  return route.startsWith(routePrefix)
    ? route.slice(routePrefix.length) || preferred
    : preferred;
}

function currentHashRoute(): string {
  return window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
}

function useCurrentHashRoute(): string {
  const [route, setRoute] = useState(currentHashRoute);
  useEffect(() => {
    const onHash = () => setRoute(currentHashRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function useHashLesson(
  course: RuntimeCourse,
  routePrefix = "",
  preferredLessonId?: string,
): [string, (id: string) => void] {
  const first = course.lessons[0]?.frontmatter.id ?? "";
  const preferred = preferredLessonId ?? first;
  const [lessonId, setLessonId] = useState(() =>
    hashLessonId(first, routePrefix, preferred),
  );
  useEffect(() => {
    const onHash = () => setLessonId(hashLessonId(first, routePrefix, preferred));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [first, preferred, routePrefix]);
  return [
    lessonId,
    (id) => {
      window.location.hash = `/${routePrefix}${id}`;
    },
  ];
}

function checkpointStatus(
  checkpoint: Checkpoint,
  completed: Set<string>,
  firstIncompleteId?: string,
): string {
  if (completed.has(checkpoint.id)) return "Completed";
  if (checkpoint.id === firstIncompleteId) return "Current";
  return "Upcoming";
}

function CheckpointPanel({
  lesson,
  state,
  dispatch,
  onRestart,
  onComplete,
  summaryOnly = false,
}: {
  lesson: RuntimeLesson;
  state: GuidedCourseStateV2;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  onRestart: (checkpointId: string) => void;
  onComplete: (checkpoint: Checkpoint, response?: string) => void;
  summaryOnly?: boolean;
}) {
  const [restartCheckpointId, setRestartCheckpointId] = useState<string | null>(null);
  const checkpoints = lesson.frontmatter.checkpoints ?? [];
  const completed = new Set(state.completedCheckpoints[lesson.frontmatter.id] ?? []);
  const firstIncompleteId = checkpoints.find(
    (checkpoint) => !completed.has(checkpoint.id),
  )?.id;
  return (
    <section className="checkpoint-panel" aria-labelledby="checkpoint-title">
      <div className="checkpoint-heading">
        <div>
          <p className="eyebrow">Guided lesson</p>
          <h2 id="checkpoint-title">Your learning checkpoints</h2>
        </div>
        <span>
          {completed.size} of {checkpoints.length}
        </span>
      </div>
      <ol className="checkpoint-list">
        {checkpoints.map((checkpoint, checkpointIndex) => {
          const isComplete = completed.has(checkpoint.id);
          const status = checkpointStatus(checkpoint, completed, firstIncompleteId);
          const response =
            state.checkpointResponses[lesson.frontmatter.id]?.[checkpoint.id];
          return (
            <li
              className={`checkpoint-item checkpoint-${status.toLowerCase()}${
                isComplete ? " checkpoint-complete" : ""
              }`}
              key={checkpoint.id}
            >
              <span className="checkpoint-marker" aria-hidden="true">
                {isComplete ? "✓" : checkpointIndex + 1}
              </span>
              <span className="checkpoint-copy">
                <strong>{checkpoint.title}</strong>
                <small className="checkpoint-status">{status}</small>
                {response?.submittedAt ? (
                  <q className="checkpoint-response">{response.text}</q>
                ) : null}
              </span>
              {isComplete ? (
                restartCheckpointId === checkpoint.id ? (
                  <span className="checkpoint-restart-confirmation">
                    <button
                      type="button"
                      onClick={() => {
                        onRestart(checkpoint.id);
                        setRestartCheckpointId(null);
                      }}
                    >
                      Confirm restart
                    </button>
                    <button type="button" onClick={() => setRestartCheckpointId(null)}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    className="checkpoint-restart"
                    type="button"
                    onClick={() => setRestartCheckpointId(checkpoint.id)}
                  >
                    Restart here
                  </button>
                )
              ) : summaryOnly ? (
                <small className="automatic-checkpoint">
                  {checkpoint.id === firstIncompleteId
                    ? "Continue in the lesson below"
                    : "Available after the prior checkpoint"}
                </small>
              ) : checkpoint.completion === "learner" ? (
                checkpoint.id === firstIncompleteId ? (
                  checkpoint.response ? (
                    <form
                      className="checkpoint-response-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        dispatch({
                          type: "submit-response",
                          lessonId: lesson.frontmatter.id,
                          checkpointId: checkpoint.id,
                        });
                        onComplete(checkpoint, response?.text);
                      }}
                    >
                      <label htmlFor={`checkpoint-${checkpoint.id}`}>
                        {checkpoint.response.prompt}
                      </label>
                      {checkpoint.response.format === "long-text" ? (
                        <textarea
                          id={`checkpoint-${checkpoint.id}`}
                          value={response?.text ?? ""}
                          onChange={(event) =>
                            dispatch({
                              type: "set-response",
                              lessonId: lesson.frontmatter.id,
                              checkpointId: checkpoint.id,
                              text: event.target.value,
                            })
                          }
                        />
                      ) : (
                        <input
                          id={`checkpoint-${checkpoint.id}`}
                          type="text"
                          value={response?.text ?? ""}
                          onChange={(event) =>
                            dispatch({
                              type: "set-response",
                              lessonId: lesson.frontmatter.id,
                              checkpointId: checkpoint.id,
                              text: event.target.value,
                            })
                          }
                        />
                      )}
                      <button type="submit" disabled={!response?.text.trim()}>
                        Save response
                      </button>
                      <small>Saved only in this browser and not graded.</small>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: "complete",
                          lessonId: lesson.frontmatter.id,
                          checkpointId: checkpoint.id,
                        });
                        onComplete(checkpoint);
                      }}
                    >
                      Mark complete
                    </button>
                  )
                ) : (
                  <small className="automatic-checkpoint">
                    Available after the prior checkpoint
                  </small>
                )
              ) : (
                <small className="automatic-checkpoint">
                  {isComplete
                    ? "Recorded from the explorable"
                    : "Complete the explorable interaction"}
                </small>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ActiveCheckpointControl({
  lesson,
  phase,
  state,
  dispatch,
  onComplete,
}: {
  lesson: RuntimeLesson;
  phase: Checkpoint["phase"];
  state: GuidedCourseStateV2;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  onComplete: (checkpoint: Checkpoint, response?: string) => void;
}) {
  const checkpoints = lesson.frontmatter.checkpoints ?? [];
  const completed = new Set(state.completedCheckpoints[lesson.frontmatter.id] ?? []);
  const checkpointIndex = checkpoints.findIndex(
    (checkpoint) => !completed.has(checkpoint.id),
  );
  const checkpoint = checkpoints[checkpointIndex];
  if (!checkpoint || checkpoint.phase !== phase) return null;
  const response = state.checkpointResponses[lesson.frontmatter.id]?.[checkpoint.id];

  return (
    <section
      className={`checkpoint-control checkpoint-control-${phase ?? "general"}`}
      aria-labelledby={`active-checkpoint-${checkpoint.id}`}
    >
      <p className="eyebrow">
        Checkpoint {checkpointIndex + 1} of {checkpoints.length}
      </p>
      <h2 id={`active-checkpoint-${checkpoint.id}`}>{checkpoint.title}</h2>
      {checkpoint.completion === "learner" ? (
        checkpoint.response ? (
          <form
            className="checkpoint-response-form"
            onSubmit={(event) => {
              event.preventDefault();
              dispatch({
                type: "submit-response",
                lessonId: lesson.frontmatter.id,
                checkpointId: checkpoint.id,
              });
              onComplete(checkpoint, response?.text);
            }}
          >
            <label htmlFor={`checkpoint-${checkpoint.id}`}>
              {checkpoint.response.prompt}
            </label>
            {checkpoint.response.format === "long-text" ? (
              <textarea
                id={`checkpoint-${checkpoint.id}`}
                value={response?.text ?? ""}
                onChange={(event) =>
                  dispatch({
                    type: "set-response",
                    lessonId: lesson.frontmatter.id,
                    checkpointId: checkpoint.id,
                    text: event.target.value,
                  })
                }
              />
            ) : (
              <input
                id={`checkpoint-${checkpoint.id}`}
                type="text"
                value={response?.text ?? ""}
                onChange={(event) =>
                  dispatch({
                    type: "set-response",
                    lessonId: lesson.frontmatter.id,
                    checkpointId: checkpoint.id,
                    text: event.target.value,
                  })
                }
              />
            )}
            <button type="submit" disabled={!response?.text.trim()}>
              Save response
            </button>
            <small>Saved only in this browser and not graded.</small>
          </form>
        ) : (
          <>
            <p>Complete the work described here before recording your progress.</p>
            <button
              type="button"
              onClick={() => {
                dispatch({
                  type: "complete",
                  lessonId: lesson.frontmatter.id,
                  checkpointId: checkpoint.id,
                });
                onComplete(checkpoint);
              }}
            >
              Mark complete
            </button>
          </>
        )
      ) : (
        <p>Use the explorable here and save meaningful evidence to continue.</p>
      )}
    </section>
  );
}

type DiscoveryLessonSegments = {
  introduction: string;
  explorable: string;
  explanation: string;
  exercise: string;
  conclusion: string;
};

function serializeLessonNodes(nodes: ChildNode[]): string {
  const wrapper = document.createElement("div");
  for (const node of nodes) wrapper.append(node.cloneNode(true));
  return wrapper.innerHTML;
}

function discoveryLessonSegments(html: string, title: string): DiscoveryLessonSegments {
  const template = document.createElement("template");
  template.innerHTML = lessonBodyHtml(html, title);
  const nodes = Array.from(template.content.childNodes);
  const explorableIndex = nodes.findIndex(
    (node) => node instanceof Element && node.matches("[data-explorable]"),
  );
  if (explorableIndex < 0)
    return {
      introduction: serializeLessonNodes(nodes),
      explorable: "",
      explanation: "",
      exercise: "",
      conclusion: "",
    };
  const exerciseIndex = nodes.findIndex(
    (node, index) =>
      index > explorableIndex &&
      node instanceof Element &&
      node.matches("[data-exercise]"),
  );
  return {
    introduction: serializeLessonNodes(nodes.slice(0, explorableIndex)),
    explorable: serializeLessonNodes(nodes.slice(explorableIndex, explorableIndex + 1)),
    explanation: serializeLessonNodes(
      nodes.slice(
        explorableIndex + 1,
        exerciseIndex < 0 ? nodes.length : exerciseIndex,
      ),
    ),
    exercise:
      exerciseIndex < 0
        ? ""
        : serializeLessonNodes(nodes.slice(exerciseIndex, exerciseIndex + 1)),
    conclusion:
      exerciseIndex < 0 ? "" : serializeLessonNodes(nodes.slice(exerciseIndex + 1)),
  };
}

const LessonHtmlFragment = memo(function LessonHtmlFragment({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  const fragmentClassName = className
    ? `lesson-fragment ${className}`
    : "lesson-fragment";
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the Markdown package sanitises this HTML before it enters runtime data.
    <div className={fragmentClassName} dangerouslySetInnerHTML={{ __html: html }} />
  );
});

function TutorLedLessonArticle({
  lesson,
  state,
  dispatch,
  onComplete,
}: {
  lesson: RuntimeLesson;
  state: GuidedCourseStateV2;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  onComplete: (checkpoint: Checkpoint, response?: string) => void;
}) {
  const segments = useMemo(
    () => discoveryLessonSegments(lesson.html, lesson.frontmatter.title),
    [lesson],
  );
  const completed = new Set(state.completedCheckpoints[lesson.frontmatter.id] ?? []);
  const checkpoint = (lesson.frontmatter.checkpoints ?? []).find(
    (candidate) => !completed.has(candidate.id),
  );
  const phase = checkpoint?.phase;
  const referenceNotes = [segments.explanation, segments.conclusion].join("");

  return (
    <article className="lesson-body tutor-led-lesson-body">
      <section
        className="tutor-handoff"
        data-tutor-lesson-id={lesson.frontmatter.id}
        data-tutor-checkpoint-id={checkpoint?.id}
        data-tutor-checkpoint-phase={phase}
      >
        <p className="eyebrow">Conversation leads; browser supports</p>
        <h2 id="tutor-handoff-title">
          {checkpoint ? checkpoint.title : "Review this lesson with your tutor"}
        </h2>
        <p>
          Tell your coding-agent tutor you are at this checkpoint. Discuss the idea in
          chat, then use this pane to predict, manipulate, and inspect evidence.
        </p>
      </section>
      <LessonHtmlFragment html={segments.introduction} className="tutor-foundations" />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="predict"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      <LessonHtmlFragment html={segments.explorable} className="tutor-activity" />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="experiment"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      <LessonHtmlFragment html={segments.exercise} className="tutor-activity" />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="apply"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="reflect"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      {referenceNotes ? (
        <details className="lesson-reference-notes">
          <summary>Open worked explanation and recap</summary>
          <p>
            These are the canonical worked examples and recap. Use them when you want to
            review or verify the conversation.
          </p>
          <LessonHtmlFragment html={referenceNotes} />
        </details>
      ) : null}
    </article>
  );
}

function DiscoveryLessonArticle({
  lesson,
  state,
  dispatch,
  onComplete,
}: {
  lesson: RuntimeLesson;
  state: GuidedCourseStateV2;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  onComplete: (checkpoint: Checkpoint, response?: string) => void;
}) {
  const segments = useMemo(
    () => discoveryLessonSegments(lesson.html, lesson.frontmatter.title),
    [lesson],
  );
  return (
    <article className="lesson-body discovery-lesson-body">
      <LessonHtmlFragment html={segments.introduction} />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="predict"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      <LessonHtmlFragment html={segments.explorable} />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="experiment"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      <LessonHtmlFragment html={segments.explanation} />
      <LessonHtmlFragment html={segments.exercise} />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="apply"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
      <LessonHtmlFragment html={segments.conclusion} />
      <ActiveCheckpointControl
        lesson={lesson}
        phase="reflect"
        state={state}
        dispatch={dispatch}
        onComplete={onComplete}
      />
    </article>
  );
}

function displayExperimentValue(value: unknown): string {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

function downloadLessonJournal(
  lesson: RuntimeLesson,
  state: GuidedCourseStateV2,
): void {
  const payload = {
    schemaVersion: 1,
    lessonId: lesson.frontmatter.id,
    exportedAt: new Date().toISOString(),
    responses: state.checkpointResponses[lesson.frontmatter.id] ?? {},
    experiments: state.experimentRuns[lesson.frontmatter.id] ?? {},
  };
  const url = URL.createObjectURL(
    new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lesson.frontmatter.id}-learning-journal.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function ExperimentJournal({
  lesson,
  state,
  dispatch,
}: {
  lesson: RuntimeLesson;
  state: GuidedCourseStateV2;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
}) {
  const byInstance = state.experimentRuns[lesson.frontmatter.id] ?? {};
  const entries = Object.entries(byInstance).filter(([, records]) => records.length);
  if (!entries.length) return null;
  const titles = new Map(
    lesson.explorables.map((explorable) => [
      explorable.instanceId,
      explorable.attributes.title,
    ]),
  );
  return (
    <section className="experiment-journal" aria-labelledby="experiment-journal-title">
      <div className="checkpoint-heading">
        <div>
          <p className="eyebrow">Local evidence</p>
          <h2 id="experiment-journal-title">Experiment journal</h2>
        </div>
        <button type="button" onClick={() => downloadLessonJournal(lesson, state)}>
          Download journal
        </button>
      </div>
      <p>
        Compare what you predicted with evidence you generated. Records stay in this
        browser and are not assessment results.
      </p>
      {entries.map(([instanceId, records]) => {
        const latest = records.at(-1) as ExperimentRecord;
        const baselineId =
          state.experimentBaselines[lesson.frontmatter.id]?.[instanceId];
        const baseline = records.find((record) => record.id === baselineId) ?? latest;
        const fields = Array.from(
          new Set([
            ...Object.keys(baseline.inputs),
            ...Object.keys(baseline.outputs),
            ...Object.keys(latest.inputs),
            ...Object.keys(latest.outputs),
          ]),
        );
        return (
          <article className="experiment-group" key={instanceId}>
            <h3>{titles.get(instanceId) ?? instanceId}</h3>
            <div className="experiment-runs">
              {records.map((record, index) => (
                <button
                  className={record.id === baseline.id ? "selected-baseline" : ""}
                  type="button"
                  key={record.id}
                  aria-pressed={record.id === baseline.id}
                  onClick={() =>
                    dispatch({
                      type: "set-experiment-baseline",
                      lessonId: lesson.frontmatter.id,
                      instanceId,
                      recordId: record.id,
                    })
                  }
                >
                  {record.label ?? `Run ${index + 1}`}
                </button>
              ))}
            </div>
            <div className="experiment-comparison">
              <table>
                <caption>Selected baseline compared with the latest run</caption>
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>Baseline</th>
                    <th>Latest</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => (
                    <tr key={field}>
                      <th>{field}</th>
                      <td>
                        {displayExperimentValue(
                          baseline.inputs[field] ?? baseline.outputs[field],
                        )}
                      </td>
                      <td>
                        {displayExperimentValue(
                          latest.inputs[field] ?? latest.outputs[field],
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {latest.summary ? <p>{latest.summary}</p> : null}
          </article>
        );
      })}
    </section>
  );
}

function savedCheckpointTitle(
  course: RuntimeCourse,
  state: GuidedCourseStateV2,
): string | null {
  const lesson = course.lessons.find(
    (candidate) => candidate.frontmatter.id === state.activeLessonId,
  );
  const completed = new Set(state.completedCheckpoints[state.activeLessonId] ?? []);
  return (
    (lesson?.frontmatter.checkpoints ?? []).find(
      (checkpoint) => !completed.has(checkpoint.id),
    )?.title ?? null
  );
}

function activeCheckpointId(
  course: RuntimeCourse,
  state: GuidedCourseStateV2,
): string | undefined {
  const lesson = course.lessons.find(
    (candidate) => candidate.frontmatter.id === state.activeLessonId,
  );
  const completed = new Set(state.completedCheckpoints[state.activeLessonId] ?? []);
  return (lesson?.frontmatter.checkpoints ?? []).find(
    (checkpoint) => !completed.has(checkpoint.id),
  )?.id;
}

function CourseOverview({
  course,
  theme,
  onToggleTheme,
  routePrefix = "",
  onBack,
}: {
  course: RuntimeCourse;
  theme: Theme;
  onToggleTheme: () => void;
  routePrefix?: string;
  onBack?: () => void;
}) {
  const persistenceEnabled = course.frontmatter.guidance?.persistLocally ?? true;
  const progress = useMemo(() => {
    if (!persistenceEnabled)
      return {
        hasSavedProgress: false,
        lessonId: course.lessons[0]?.frontmatter.id ?? "",
        checkpoint: null,
      };

    const sessionRead = readBrowserStorage(courseSessionStorageKey(course));
    const session = parseCourseSessionState(course, sessionRead.value);
    if (!course.frontmatter.guidance)
      return {
        hasSavedProgress: Boolean(sessionRead.value),
        lessonId: session?.activeLessonId ?? course.lessons[0]?.frontmatter.id ?? "",
        checkpoint: null,
      };

    const currentGuidedRead = readBrowserStorage(guidedStorageKey(course));
    const guidedRead = currentGuidedRead.value
      ? currentGuidedRead
      : readBrowserStorage(legacyGuidedStorageKey(course));
    const guidedState = parseGuidedState(course, guidedRead.value);
    return {
      hasSavedProgress: Boolean(sessionRead.value || guidedRead.value),
      lessonId: guidedState.activeLessonId,
      checkpoint: savedCheckpointTitle(course, guidedState),
    };
  }, [course, persistenceEnabled]);
  const savedLesson = course.lessons.find(
    (lesson) => lesson.frontmatter.id === progress.lessonId,
  );
  const firstLesson = course.lessons[0];
  const destination = progress.hasSavedProgress ? savedLesson : firstLesson;

  return (
    <main className="course-overview">
      <header className="course-overview-masthead">
        {onBack ? (
          <button className="brand brand-button" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> All courses
          </button>
        ) : (
          <a className="brand" href="#/">
            Explorables
          </a>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>
      <section className="course-overview-hero" aria-labelledby="course-overview-title">
        <div>
          <p className="eyebrow">Course overview</p>
          <h1 id="course-overview-title">{course.frontmatter.title}</h1>
          <p className="course-overview-summary">{course.frontmatter.summary}</p>
        </div>
        <dl className="course-overview-facts">
          {course.frontmatter.estimatedHours ? (
            <div>
              <dt>Estimated time</dt>
              <dd>About {course.frontmatter.estimatedHours} hours</dd>
            </div>
          ) : null}
          <div>
            <dt>Lessons</dt>
            <dd>{course.lessons.length}</dd>
          </div>
          {course.frontmatter.audience?.length ? (
            <div>
              <dt>Designed for</dt>
              <dd>{course.frontmatter.audience.join(", ")}</dd>
            </div>
          ) : null}
          {course.frontmatter.prerequisites?.length ? (
            <div>
              <dt>Prerequisites</dt>
              <dd>{course.frontmatter.prerequisites.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      </section>
      <section className="course-overview-start" aria-labelledby="course-start-title">
        <div>
          <p className="eyebrow">Your course session</p>
          <h2 id="course-start-title">
            {progress.hasSavedProgress
              ? "Continue where you stopped"
              : "Begin with context"}
          </h2>
          <p>
            {progress.hasSavedProgress && savedLesson
              ? `Saved at ${savedLesson.frontmatter.title}${progress.checkpoint ? ` — ${progress.checkpoint}` : ""}.`
              : "Read the orientation first, then move into the technical lessons. Progress stays in this browser."}
          </p>
        </div>
        {destination ? (
          <button
            className="course-action"
            type="button"
            onClick={() => {
              window.location.hash = `/${routePrefix}${destination.frontmatter.id}`;
            }}
          >
            {progress.hasSavedProgress ? "Resume course" : "Start course"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        ) : null}
      </section>
      <CourseIntroduction
        html={course.introductionHtml}
        title={course.frontmatter.title}
      />
    </main>
  );
}

function CourseSessionPanel({
  course,
  currentLesson,
  savedSession,
  hasSavedProgress,
  guidedState,
  persistenceEnabled,
  persistenceAvailable,
  onResume,
  onReset,
}: {
  course: RuntimeCourse;
  currentLesson: RuntimeLesson;
  savedSession: CourseSessionStateV1 | null;
  hasSavedProgress: boolean;
  guidedState: GuidedCourseStateV2;
  persistenceEnabled: boolean;
  persistenceAvailable: boolean;
  onResume: () => void;
  onReset: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const savedLessonId = course.frontmatter.guidance
    ? guidedState.activeLessonId
    : (savedSession?.activeLessonId ?? course.lessons[0]?.frontmatter.id);
  const savedLesson = course.lessons.find(
    (lesson) => lesson.frontmatter.id === savedLessonId,
  );
  const checkpoint = course.frontmatter.guidance
    ? savedCheckpointTitle(course, guidedState)
    : null;
  return (
    <section className="course-session-panel" aria-labelledby="course-session-title">
      <div>
        <p className="eyebrow">Course session</p>
        <h2 id="course-session-title">
          {hasSavedProgress ? "Your progress is saved" : "Start here, return anytime"}
        </h2>
        <p>
          {!persistenceEnabled
            ? "This course does not save progress after the page closes."
            : persistenceAvailable
              ? savedLesson
                ? `Saved at ${savedLesson.frontmatter.title}${checkpoint ? ` — ${checkpoint}` : ""}${savedSession ? ` on ${new Date(savedSession.updatedAt).toLocaleString()}` : ""}.`
                : "Progress is saved locally as you work."
              : "Browser storage is unavailable. Progress will last only for this open page."}
        </p>
      </div>
      {savedLesson ? (
        <button type="button" onClick={onResume}>
          {!hasSavedProgress
            ? "Start course"
            : savedLesson.frontmatter.id === currentLesson.frontmatter.id
              ? "Resume this course here"
              : "Resume saved progress"}
        </button>
      ) : null}
      <details>
        <summary>How to pause, resume, or change position</summary>
        <ul>
          <li>
            <q>Pause this course</q> or <q>End this session</q> saves your place.
          </li>
          <li>
            <q>Resume this course</q> returns to the saved lesson and checkpoint.
          </li>
          <li>
            <q>Review lesson …</q> revisits earlier material without changing progress.
          </li>
          <li>
            <q>Explore lesson …</q> looks ahead while preserving Guided progress.
          </li>
          <li>
            <q>Restart from checkpoint …</q> rolls progress back after confirmation.
          </li>
          <li>
            <q>Finish the course</q> means completing the final checkpoint.
          </li>
        </ul>
        <p>
          This works in the same browser profile, course version, and local address. If
          you started from a terminal, press <kbd>Ctrl</kbd>+<kbd>C</kbd> after pausing.
        </p>
        {confirmReset ? (
          <div className="mode-confirmation" role="alert">
            <p>Reset all saved progress for this course?</p>
            <button type="button" onClick={onReset}>
              Reset course
            </button>
            <button type="button" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)}>
            Reset this course
          </button>
        )}
      </details>
    </section>
  );
}

function LessonNavigation({
  course,
  lesson,
  state,
  routePrefix,
  onSelect,
}: {
  course: RuntimeCourse;
  lesson: RuntimeLesson;
  state: GuidedCourseStateV2;
  routePrefix: string;
  onSelect?: () => void;
}) {
  const guidance = course.frontmatter.guidance;
  return (
    <nav className="lesson-navigation" aria-label="Course lessons">
      <ol>
        {course.lessons.map((item, itemIndex) => {
          const current = item.frontmatter.id === lesson.frontmatter.id;
          const unlocked =
            !guidance || isLessonUnlocked(course, state, item.frontmatter.id);
          const complete =
            Boolean(guidance) && isLessonComplete(course, state, item.frontmatter.id);
          const stateLabel = complete
            ? "Done"
            : current
              ? "Current"
              : unlocked
                ? "Available"
                : "Locked";
          const content = (
            <>
              <span className="lesson-number" aria-hidden="true">
                {String(itemIndex + 1).padStart(2, "0")}
              </span>
              <span className="lesson-link-copy">
                <span>{item.frontmatter.title}</span>
                <small>{stateLabel}</small>
              </span>
            </>
          );
          return (
            <li
              className={`lesson-nav-item lesson-${stateLabel.toLowerCase()}`}
              key={item.frontmatter.id}
            >
              {unlocked ? (
                <a
                  aria-current={current ? "page" : undefined}
                  href={`#/${routePrefix}${item.frontmatter.id}`}
                  onClick={onSelect}
                >
                  {content}
                </a>
              ) : (
                <span className="locked-lesson" aria-disabled="true">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function GuidedTools({
  course,
  state,
  dispatch,
  routePrefix,
}: {
  course: RuntimeCourse;
  state: GuidedCourseStateV2;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  routePrefix: string;
}) {
  const [question, setQuestion] = useState("");
  const [confirmation, setConfirmation] = useState<"explore" | null>(null);
  const guidance = course.frontmatter.guidance;
  if (!guidance) return null;

  const publishModeChange = (mode: "guided" | "explore") => {
    const lesson = course.lessons.find(
      (candidate) => candidate.frontmatter.id === state.activeLessonId,
    );
    if (!lesson) return;
    publishTutorInteraction({
      schemaVersion: 1,
      type: "mode-changed",
      courseId: course.frontmatter.id,
      courseVersion: course.frontmatter.version,
      lessonId: lesson.frontmatter.id,
      lessonTitle: lesson.frontmatter.title,
      mode,
      source: "learner",
    });
  };

  const park = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: "park-question", question });
    setQuestion("");
  };
  return (
    <section className="guided-tools" aria-label="Course guidance">
      <p className="mode-label">
        Mode: <strong>{state.mode === "guided" ? "Guided" : "Explore"}</strong>
      </p>
      {state.mode === "guided" && guidance.allowExploreMode ? (
        confirmation === "explore" ? (
          <div className="mode-confirmation" role="alert">
            <p>
              Explore mode unlocks every lesson. Your guided progress remains saved.
            </p>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "set-mode", mode: "explore" });
                publishModeChange("explore");
                setConfirmation(null);
              }}
            >
              Enter Explore mode
            </button>
            <button type="button" onClick={() => setConfirmation(null)}>
              Stay guided
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmation("explore")}>
            Switch to Explore mode
          </button>
        )
      ) : state.mode === "explore" ? (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "set-mode", mode: "guided" });
            publishModeChange("guided");
            window.location.hash = `/${routePrefix}${state.activeLessonId}`;
          }}
        >
          Return to Guided mode
        </button>
      ) : null}

      <details className="parking-lot">
        <summary>Question parking lot ({state.parkedQuestions.length})</summary>
        <p>Save a broader question here and return to the current lesson.</p>
        <form onSubmit={park}>
          <label htmlFor="parked-question">Question to revisit</label>
          <textarea
            id="parked-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button type="submit" disabled={!question.trim()}>
            Park question
          </button>
        </form>
        {state.parkedQuestions.length > 0 ? (
          <ul>
            {state.parkedQuestions.map((item, index) => (
              <li key={item}>
                <span>{item}</span>
                <button
                  type="button"
                  aria-label={`Remove parked question: ${item}`}
                  onClick={() => dispatch({ type: "remove-question", index })}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </details>

      <small>
        Progress stays in this browser profile. No account or server is used.
      </small>
    </section>
  );
}

function Lesson({
  course,
  theme,
  onToggleTheme,
  routePrefix = "",
  onBack,
}: {
  course: RuntimeCourse;
  theme: Theme;
  onToggleTheme: () => void;
  routePrefix?: string;
  onBack?: () => void;
}) {
  const guidance = course.frontmatter.guidance;
  const persistenceEnabled = guidance?.persistLocally ?? true;
  const initialSessionRead = useMemo(
    () =>
      persistenceEnabled
        ? readBrowserStorage(courseSessionStorageKey(course))
        : { value: null, available: true },
    [course, persistenceEnabled],
  );
  const initialGuidedRead = useMemo(() => {
    if (!persistenceEnabled) return { value: null, available: true };
    const current = readBrowserStorage(guidedStorageKey(course));
    if (current.value) return current;
    const legacy = readBrowserStorage(legacyGuidedStorageKey(course));
    return {
      value: legacy.value,
      available: current.available && legacy.available,
    };
  }, [course, persistenceEnabled]);
  const initialSession = useMemo(
    () => parseCourseSessionState(course, initialSessionRead.value),
    [course, initialSessionRead.value],
  );
  const [startupSession, setStartupSession] = useState(initialSession);
  const [hasSavedProgress, setHasSavedProgress] = useState(
    Boolean(initialSessionRead.value || (guidance && initialGuidedRead.value)),
  );
  const [state, dispatch] = useReducer(
    guidedCourseReducer,
    initialGuidedRead.value,
    (serialized) =>
      parseGuidedState(course, guidance?.persistLocally ? serialized : null),
  );
  const [persistenceAvailable, setPersistenceAvailable] = useState(
    initialSessionRead.available && initialGuidedRead.available,
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const sessionRef = useRef<CourseSessionStateV1>(
    initialSession ??
      createCourseSessionState(
        course,
        guidance && initialGuidedRead.value ? state.activeLessonId : undefined,
      ),
  );
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const sandboxControllers = useRef<SandboxController[]>([]);
  const preferredLessonId =
    guidance && initialGuidedRead.value
      ? state.activeLessonId
      : initialSession?.activeLessonId;
  const [requestedLessonId, navigate] = useHashLesson(
    course,
    routePrefix,
    preferredLessonId,
  );
  const [navigationNotice, setNavigationNotice] = useState<string | null>(null);
  const compactNavigation = useCompactNavigation();
  const compactContents = useRef<HTMLDetailsElement>(null);
  const [contentsOpen, setContentsOpen] = useState(() => !compactNavigation);

  useEffect(() => setContentsOpen(!compactNavigation), [compactNavigation]);

  useEffect(() => {
    if (!guidance?.persistLocally) return;
    if (!writeBrowserStorage(guidedStorageKey(course), JSON.stringify(state)))
      setPersistenceAvailable(false);
    else removeBrowserStorage(legacyGuidedStorageKey(course));
  }, [course, guidance?.persistLocally, state]);

  useEffect(() => {
    if (
      guidance &&
      state.mode === "guided" &&
      !isLessonUnlocked(course, state, requestedLessonId)
    ) {
      setNavigationNotice(
        "That lesson is still ahead. Finish or skip the current lesson, or use Explore mode.",
      );
      navigate(state.activeLessonId);
    }
  }, [course, guidance, navigate, requestedLessonId, state]);

  const lesson = useMemo(() => {
    const allowedId =
      guidance &&
      state.mode === "guided" &&
      !isLessonUnlocked(course, state, requestedLessonId)
        ? state.activeLessonId
        : requestedLessonId;
    return (
      course.lessons.find((candidate) => candidate.frontmatter.id === allowedId) ??
      course.lessons[0]
    );
  }, [course, guidance, requestedLessonId, state]);

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (!lesson) return;
    const session = createCourseSessionState(course, lesson.frontmatter.id);
    sessionRef.current = session;
    if (!writeBrowserStorage(courseSessionStorageKey(course), JSON.stringify(session)))
      setPersistenceAvailable(false);
  }, [course, lesson, persistenceEnabled]);

  useEffect(() => {
    const flush = () => {
      if (!persistenceEnabled) return;
      writeBrowserStorage(
        courseSessionStorageKey(course),
        JSON.stringify(sessionRef.current),
      );
      if (guidance?.persistLocally)
        writeBrowserStorage(guidedStorageKey(course), JSON.stringify(stateRef.current));
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [course, guidance?.persistLocally, persistenceEnabled]);

  useEffect(() => {
    if (!lesson) return;
    document.getElementById("lesson")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0 });
  }, [lesson]);

  useEffect(() => {
    if (!lesson) return;
    publishTutorInteraction({
      schemaVersion: 1,
      type: "lesson-opened",
      courseId: course.frontmatter.id,
      courseVersion: course.frontmatter.version,
      lessonId: lesson.frontmatter.id,
      lessonTitle: lesson.frontmatter.title,
    });
  }, [course.frontmatter.id, course.frontmatter.version, lesson]);

  useEffect(() => {
    if (!lesson) return;
    const controllers: SandboxController[] = [];
    const statuses: HTMLElement[] = [];
    for (const explorable of lesson.explorables) {
      const host = document.querySelector<HTMLElement>(
        `[data-instance-id="${CSS.escape(explorable.instanceId)}"]`,
      );
      if (!host) continue;
      for (const staleStatus of host.querySelectorAll(
        ":scope > .explorable-status, :scope > .explorable-error",
      ))
        staleStatus.remove();
      const status = document.createElement("p");
      status.className = "explorable-status";
      status.setAttribute("role", "status");
      const controller = mountSandbox(host, {
        instanceId: explorable.instanceId,
        title: explorable.attributes.title,
        height: explorable.attributes.height,
        html: explorable.sandboxHtml,
        theme: themeRef.current,
        onEvent: (event) => {
          status.textContent = `Interaction: ${event.type}`;
          const checkpoints = lesson.frontmatter.checkpoints ?? [];
          for (const [checkpointIndex, checkpoint] of checkpoints.entries()) {
            const completed = new Set(
              stateRef.current.completedCheckpoints[lesson.frontmatter.id] ?? [],
            );
            const priorCheckpointsComplete = checkpoints
              .slice(0, checkpointIndex)
              .every((candidate) => completed.has(candidate.id));
            if (
              checkpoint.completion === "explorable-event" &&
              checkpoint.instanceId === explorable.instanceId &&
              checkpoint.event === event.type &&
              priorCheckpointsComplete
            ) {
              if (event.type === "experiment-recorded") {
                const record = createExperimentRecord(event.payload, {
                  instanceId: explorable.instanceId,
                  checkpointId: checkpoint.id,
                });
                if (!record) {
                  status.textContent =
                    "The experiment ran, but its evidence record was invalid.";
                  continue;
                }
                dispatch({
                  type: "record-experiment",
                  lessonId: lesson.frontmatter.id,
                  record,
                });
              }
              if (!completed.has(checkpoint.id)) {
                dispatch({
                  type: "complete",
                  lessonId: lesson.frontmatter.id,
                  checkpointId: checkpoint.id,
                });
                publishTutorInteraction({
                  schemaVersion: 1,
                  type: "checkpoint-completed",
                  courseId: course.frontmatter.id,
                  courseVersion: course.frontmatter.version,
                  lessonId: lesson.frontmatter.id,
                  lessonTitle: lesson.frontmatter.title,
                  checkpointId: checkpoint.id,
                  checkpointTitle: checkpoint.title,
                  source: "explorable",
                });
              }
            }
          }
        },
        onError: (message) => {
          status.className = "explorable-error";
          status.setAttribute("role", "alert");
          status.textContent = `This explorable failed independently: ${message}`;
        },
      });
      host.append(status);
      statuses.push(status);
      controllers.push(controller);
    }
    sandboxControllers.current = controllers;

    for (const exercise of lesson.exercises) {
      const host = document.querySelector<HTMLElement>(
        `[data-exercise][data-path="${CSS.escape(exercise.attributes.path)}"]`,
      );
      if (!host || host.querySelector(".exercise-heading")) continue;
      const heading = document.createElement("h3");
      heading.className = "exercise-heading";
      heading.textContent = exercise.attributes.title;
      const pathText = document.createElement("p");
      pathText.className = "exercise-path";
      pathText.innerHTML = `Open <code>${exercise.attributes.path}</code> in the coding workspace${
        exercise.attributes.command
          ? ` and run <code>${exercise.attributes.command}</code>`
          : ""
      }.`;
      host.prepend(heading, pathText);
    }
    return () => {
      if (sandboxControllers.current === controllers) sandboxControllers.current = [];
      controllers.forEach((controller) => {
        controller.destroy();
      });
      for (const status of statuses) status.remove();
    };
  }, [course.frontmatter.id, course.frontmatter.version, lesson]);

  useEffect(() => {
    for (const controller of sandboxControllers.current) controller.setTheme(theme);
  }, [theme]);

  if (!lesson) return <p role="alert">This course has no lessons.</p>;
  const index = course.lessons.indexOf(lesson);
  const previous = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const canAdvance =
    !guidance ||
    state.mode === "explore" ||
    isLessonComplete(course, state, lesson.frontmatter.id);
  const contextualCheckpoints = Boolean(lesson.frontmatter.discoveryCycle);
  const tutorLed = course.frontmatter.teaching?.mode === "tutor-led";

  const publishLearnerCheckpoint = (checkpoint: Checkpoint, response?: string) => {
    publishTutorInteraction({
      schemaVersion: 1,
      type: "checkpoint-completed",
      courseId: course.frontmatter.id,
      courseVersion: course.frontmatter.version,
      lessonId: lesson.frontmatter.id,
      lessonTitle: lesson.frontmatter.title,
      checkpointId: checkpoint.id,
      checkpointTitle: checkpoint.title,
      ...(response ? { response } : {}),
      source: "learner",
    });
  };

  const goNext = () => {
    if (!next || !canAdvance) return;
    if (guidance && state.mode === "guided") {
      const activeIndex = course.lessons.findIndex(
        (candidate) => candidate.frontmatter.id === state.activeLessonId,
      );
      if (index + 1 > activeIndex)
        dispatch({ type: "advance", lessonId: next.frontmatter.id });
    }
    setNavigationNotice(null);
    navigate(next.frontmatter.id);
  };

  const resetCourse = () => {
    const resetState = createGuidedState(course);
    const resetSession = createCourseSessionState(course);
    const guidedRemoved = removeBrowserStorage(guidedStorageKey(course));
    const legacyGuidedRemoved = removeBrowserStorage(legacyGuidedStorageKey(course));
    const sessionRemoved = removeBrowserStorage(courseSessionStorageKey(course));
    setPersistenceAvailable(guidedRemoved && legacyGuidedRemoved && sessionRemoved);
    setStartupSession(null);
    setHasSavedProgress(false);
    stateRef.current = resetState;
    sessionRef.current = resetSession;
    dispatch({ type: "reset", state: resetState });
    navigate(course.lessons[0]?.frontmatter.id ?? "");
  };

  const resumeCourse = () => {
    navigate(
      guidance
        ? state.activeLessonId
        : (startupSession?.activeLessonId ?? course.lessons[0]?.frontmatter.id ?? ""),
    );
  };

  return (
    <div className="course-layout">
      <aside className="course-sidebar">
        <div className="course-sidebar-header">
          <div className="course-sidebar-masthead">
            {onBack ? (
              <button className="brand brand-button" type="button" onClick={onBack}>
                <span aria-hidden="true">←</span> All courses
              </button>
            ) : (
              <a className="brand" href="#/">
                Explorables
              </a>
            )}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <p className="course-title">{course.frontmatter.title}</p>
        </div>
        <details
          className="compact-course-contents"
          open={contentsOpen}
          ref={compactContents}
          onToggle={(event) => {
            if (compactNavigation) setContentsOpen(event.currentTarget.open);
          }}
        >
          <summary>
            <span>Course contents</span>
            <small>
              Lesson {index + 1} of {course.lessons.length}
            </small>
            <span className="contents-chevron" aria-hidden="true" />
          </summary>
          <div className="compact-course-body">
            <LessonNavigation
              course={course}
              lesson={lesson}
              state={state}
              routePrefix={routePrefix}
              onSelect={() => {
                if (compactNavigation) setContentsOpen(false);
              }}
            />
            <GuidedTools
              course={course}
              state={state}
              dispatch={dispatch}
              routePrefix={routePrefix}
            />
          </div>
        </details>
      </aside>
      <main
        id="lesson"
        className="lesson"
        tabIndex={-1}
        data-explorables-course-id={course.frontmatter.id}
        data-explorables-course-version={course.frontmatter.version}
        data-explorables-mode={guidance ? state.mode : "unguided"}
        data-explorables-teaching-mode={
          course.frontmatter.teaching?.mode ?? "browser-led"
        }
        data-explorables-guided-lesson-id={guidance ? state.activeLessonId : undefined}
        data-explorables-visible-lesson-id={lesson.frontmatter.id}
        data-explorables-checkpoint-id={
          guidance ? activeCheckpointId(course, state) : undefined
        }
        data-explorables-persistence={
          !persistenceEnabled
            ? "disabled"
            : persistenceAvailable
              ? "available"
              : "unavailable"
        }
      >
        {navigationNotice ? (
          <p className="navigation-notice" role="status">
            {navigationNotice}
          </p>
        ) : null}
        <header className="lesson-header">
          <p className="eyebrow">
            Lesson {index + 1} of {course.lessons.length}
          </p>
          <h1>{lesson.frontmatter.title}</h1>
        </header>
        {tutorLed ? (
          <details className="compact-session">
            <summary>Session and saved progress</summary>
            <CourseSessionPanel
              course={course}
              currentLesson={lesson}
              savedSession={startupSession}
              hasSavedProgress={hasSavedProgress}
              guidedState={state}
              persistenceEnabled={persistenceEnabled}
              persistenceAvailable={persistenceAvailable}
              onResume={resumeCourse}
              onReset={resetCourse}
            />
          </details>
        ) : (
          <CourseSessionPanel
            course={course}
            currentLesson={lesson}
            savedSession={startupSession}
            hasSavedProgress={hasSavedProgress}
            guidedState={state}
            persistenceEnabled={persistenceEnabled}
            persistenceAvailable={persistenceAvailable}
            onResume={resumeCourse}
            onReset={resetCourse}
          />
        )}
        {guidance && state.mode === "guided" ? (
          <>
            <CheckpointPanel
              lesson={lesson}
              state={state}
              dispatch={dispatch}
              summaryOnly={contextualCheckpoints}
              onComplete={publishLearnerCheckpoint}
              onRestart={(checkpointId) => {
                const restarted = restartGuidedStateFrom(
                  course,
                  stateRef.current,
                  lesson.frontmatter.id,
                  checkpointId,
                );
                stateRef.current = restarted;
                dispatch({ type: "reset", state: restarted });
                const checkpoint = lesson.frontmatter.checkpoints?.find(
                  (candidate) => candidate.id === checkpointId,
                );
                publishTutorInteraction({
                  schemaVersion: 1,
                  type: "checkpoint-restarted",
                  courseId: course.frontmatter.id,
                  courseVersion: course.frontmatter.version,
                  lessonId: lesson.frontmatter.id,
                  lessonTitle: lesson.frontmatter.title,
                  checkpointId,
                  ...(checkpoint ? { checkpointTitle: checkpoint.title } : {}),
                  source: "learner",
                });
                navigate(lesson.frontmatter.id);
              }}
            />
            <ExperimentJournal lesson={lesson} state={state} dispatch={dispatch} />
          </>
        ) : null}
        {guidance && state.mode === "guided" && tutorLed ? (
          <TutorLedLessonArticle
            lesson={lesson}
            state={state}
            dispatch={dispatch}
            onComplete={publishLearnerCheckpoint}
          />
        ) : guidance && state.mode === "guided" && contextualCheckpoints ? (
          <DiscoveryLessonArticle
            lesson={lesson}
            state={state}
            dispatch={dispatch}
            onComplete={publishLearnerCheckpoint}
          />
        ) : (
          <LessonArticle html={lesson.html} title={lesson.frontmatter.title} />
        )}
        <nav className="lesson-pagination" aria-label="Lesson pagination">
          {previous ? (
            <button type="button" onClick={() => navigate(previous.frontmatter.id)}>
              ← {previous.frontmatter.title}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <div className="next-actions">
              {guidance &&
              state.mode === "guided" &&
              guidance.allowSkipping &&
              !canAdvance ? (
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: "skip",
                      lessonId: lesson.frontmatter.id,
                      nextLessonId: next.frontmatter.id,
                    });
                    publishTutorInteraction({
                      schemaVersion: 1,
                      type: "lesson-skipped",
                      courseId: course.frontmatter.id,
                      courseVersion: course.frontmatter.version,
                      lessonId: lesson.frontmatter.id,
                      lessonTitle: lesson.frontmatter.title,
                      source: "learner",
                    });
                    navigate(next.frontmatter.id);
                  }}
                >
                  Skip lesson
                </button>
              ) : null}
              <button type="button" disabled={!canAdvance} onClick={goNext}>
                {next.frontmatter.title} →
              </button>
              {!canAdvance ? (
                <small>Complete the active checkpoint in the lesson to continue.</small>
              ) : null}
            </div>
          ) : (
            <span>
              {canAdvance ? "Course complete" : "Complete the final checkpoints"}
            </span>
          )}
        </nav>
      </main>
    </div>
  );
}

function courseIdFromHash(): string | null {
  const route = window.location.hash.replace(/^#\/?/, "");
  const match = route.match(/^courses\/([^/]+)(?:\/|$)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function LibraryHome({
  collection,
  theme,
  onToggleTheme,
}: {
  collection: RuntimeCourseCollection;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const availableCourses = collection.tracks
    .flatMap((track) => track.courses)
    .filter((course) => course.status === "available");
  const plannedTracks = collection.tracks
    .map((track) => ({
      ...track,
      courses: track.courses.filter((course) => course.status === "planned"),
    }))
    .filter((track) => track.courses.length > 0);
  const plannedCourseCount = plannedTracks.reduce(
    (total, track) => total + track.courses.length,
    0,
  );

  return (
    <main id="library" className="course-library">
      <header className="library-hero">
        <div className="library-masthead">
          <a className="brand" href="#/courses" aria-label="Explorables course library">
            Explorables
          </a>
          <div className="library-masthead-actions">
            <nav className="library-navigation" aria-label="Course library">
              <a href="#available-courses">Courses</a>
              {plannedCourseCount > 0 ? <a href="#course-roadmap">Roadmap</a> : null}
            </nav>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
        <div className="library-hero-content">
          <div>
            <p className="eyebrow library-eyebrow">Interactive technical courses</p>
            <h1 className="library-title">{collection.title}</h1>
          </div>
          <div className="library-introduction">
            <p className="library-summary">{collection.summary}</p>
            <ul
              className="library-principles"
              aria-label="How Explorables courses work"
            >
              <li>Manipulate live explanations</li>
              <li>Work with real code and tests</li>
              <li>Learn with a coding-agent tutor</li>
            </ul>
          </div>
        </div>
        <p className="local-note">
          <strong>Runs locally.</strong> Course files, exercises, and progress stay on
          this computer.
        </p>
      </header>

      <section
        className="library-section available-courses"
        id="available-courses"
        aria-labelledby="available-courses-title"
      >
        <div className="library-section-heading">
          <p className="track-kicker">
            {availableCourses.length}{" "}
            {availableCourses.length === 1 ? "course" : "courses"}
          </p>
          <h2 id="available-courses-title">Available now</h2>
          <p>Choose a course and continue at your own pace.</p>
        </div>
        {availableCourses.length > 0 ? (
          <div className="course-grid available-course-grid">
            {availableCourses.map((course) => (
              <article
                className={`course-card course-available${course.featured ? " featured-course" : ""}`}
                key={course.id}
              >
                <div className="course-card-heading">
                  <p className="course-status">Ready to start</p>
                  {course.version ? <small>v{course.version}</small> : null}
                </div>
                <h3>{course.title}</h3>
                <p>{course.summary}</p>
                <p className="course-meta">
                  {[
                    course.lessonCount ? `${course.lessonCount} lessons` : undefined,
                    course.estimatedHours
                      ? `about ${course.estimatedHours} hours`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {course.tags.length ? (
                  <ul className="course-tags" aria-label="Topics">
                    {course.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
                <a
                  className="course-action"
                  href={`#/courses/${encodeURIComponent(course.id)}`}
                >
                  Open course <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-library-state">No courses are available yet.</p>
        )}
      </section>

      {plannedCourseCount > 0 ? (
        <section
          className="library-section course-roadmap"
          id="course-roadmap"
          aria-labelledby="course-roadmap-title"
        >
          <div className="library-section-heading">
            <p className="track-kicker">{plannedCourseCount} planned courses</p>
            <h2 id="course-roadmap-title">On the roadmap</h2>
            <p>
              These courses show where the library is headed. They are not available to
              open yet.
            </p>
          </div>
          <div className="roadmap-groups">
            {plannedTracks.map((track) => (
              <section
                className="roadmap-group"
                key={track.id}
                aria-labelledby={`${track.id}-roadmap`}
              >
                <div className="track-heading">
                  <h3 className="track-title" id={`${track.id}-roadmap`}>
                    {track.title}
                  </h3>
                  <p className="track-summary">{track.summary}</p>
                </div>
                <div className="roadmap-list">
                  {track.courses.map((course) => (
                    <article className="roadmap-card" key={course.id}>
                      <div className="roadmap-card-copy">
                        <div className="course-card-heading">
                          <p className="course-status">Planned</p>
                          {course.estimatedHours ? (
                            <small>about {course.estimatedHours} hours</small>
                          ) : null}
                        </div>
                        <h4>{course.title}</h4>
                        <p>{course.summary}</p>
                        {course.tags.length ? (
                          <ul className="course-tags" aria-label="Topics">
                            {course.tags.map((tag) => (
                              <li key={tag}>{tag}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <span className="planned-label">Coming later</span>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function CollectionCourse({
  courseId,
  theme,
  onToggleTheme,
}: {
  courseId: string;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [course, setCourse] = useState<RuntimeCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const route = useCurrentHashRoute();
  useEffect(() => {
    setCourse(null);
    setError(null);
    fetch(`./courses/${encodeURIComponent(courseId)}/course.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Course request failed (${response.status})`);
        return response.json() as Promise<RuntimeCourse>;
      })
      .then(setCourse)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : String(reason)),
      );
  }, [courseId]);
  if (error)
    return (
      <main className="fatal-error" role="alert">
        Could not load the course: {error}
        <p>
          <a href="#/courses">Return to the course library</a>
        </p>
      </main>
    );
  if (!course)
    return (
      <main className="loading" aria-busy="true">
        Loading course…
      </main>
    );
  const courseRoute = `courses/${encodeURIComponent(courseId)}`;
  if (route === courseRoute)
    return (
      <CourseOverview
        course={course}
        theme={theme}
        onToggleTheme={onToggleTheme}
        routePrefix={`${courseRoute}/lessons/`}
        onBack={() => {
          window.location.hash = "/courses";
        }}
      />
    );
  return (
    <Lesson
      course={course}
      theme={theme}
      onToggleTheme={onToggleTheme}
      routePrefix={`courses/${encodeURIComponent(courseId)}/lessons/`}
      onBack={() => {
        window.location.hash = "/courses";
      }}
    />
  );
}

function CollectionApp({
  collection,
  theme,
  onToggleTheme,
}: {
  collection: RuntimeCourseCollection;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [courseId, setCourseId] = useState(courseIdFromHash);
  useEffect(() => {
    const onHash = () => setCourseId(courseIdFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const knownCourse = collection.tracks
    .flatMap((track) => track.courses)
    .find((course) => course.id === courseId && course.status === "available");
  if (!courseId)
    return (
      <LibraryHome
        collection={collection}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    );
  if (!knownCourse)
    return (
      <main className="fatal-error" role="alert">
        That course is not available in this local collection.
        <p>
          <a href="#/courses">Return to the course library</a>
        </p>
      </main>
    );
  return (
    <CollectionCourse
      key={courseId}
      courseId={courseId}
      theme={theme}
      onToggleTheme={onToggleTheme}
    />
  );
}

export function CourseApp() {
  const [theme, toggleTheme] = useTheme();
  const route = useCurrentHashRoute();
  const [course, setCourse] = useState<RuntimeCourse | null>(null);
  const [collection, setCollection] = useState<RuntimeCourseCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      const libraryResponse = await fetch("./explorables-library.json");
      const contentType = libraryResponse.headers.get("content-type") ?? "";
      if (libraryResponse.ok && contentType.includes("application/json")) {
        setCollection((await libraryResponse.json()) as RuntimeCourseCollection);
        return;
      }
      const courseResponse = await fetch("./course.json");
      if (!courseResponse.ok)
        throw new Error(`Course request failed (${courseResponse.status})`);
      setCourse((await courseResponse.json()) as RuntimeCourse);
    };
    load().catch((reason: unknown) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
  }, []);
  if (error)
    return (
      <main className="fatal-error" role="alert">
        Could not load Explorables: {error}
      </main>
    );
  if (collection)
    return (
      <CollectionApp
        collection={collection}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  if (course)
    return route ? (
      <Lesson course={course} theme={theme} onToggleTheme={toggleTheme} />
    ) : (
      <CourseOverview course={course} theme={theme} onToggleTheme={toggleTheme} />
    );
  return (
    <main className="loading" aria-busy="true">
      Loading Explorables…
    </main>
  );
}
