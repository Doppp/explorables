import type {
  Checkpoint,
  CourseSessionStateV1,
  GuidedCourseStateV1,
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
import {
  createGuidedState,
  guidedCourseReducer,
  guidedStorageKey,
  isLessonComplete,
  isLessonUnlocked,
  parseGuidedState,
  restartGuidedStateFrom,
} from "./guided-state.ts";
import { lessonBodyHtml } from "./lesson-html.ts";

const LessonArticle = memo(function LessonArticle({
  html,
  title,
}: {
  html: string;
  title: string;
}) {
  const sanitizedMarkup = { __html: lessonBodyHtml(html, title) };
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the Markdown package sanitises this HTML before it enters runtime data.
    <article className="lesson-body" dangerouslySetInnerHTML={sanitizedMarkup} />
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
}: {
  lesson: RuntimeLesson;
  state: GuidedCourseStateV1;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  onRestart: (checkpointId: string) => void;
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
              ) : checkpoint.completion === "learner" ? (
                checkpoint.id === firstIncompleteId ? (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "complete",
                        lessonId: lesson.frontmatter.id,
                        checkpointId: checkpoint.id,
                      })
                    }
                  >
                    Mark complete
                  </button>
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

function savedCheckpointTitle(
  course: RuntimeCourse,
  state: GuidedCourseStateV1,
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
  state: GuidedCourseStateV1,
): string | undefined {
  const lesson = course.lessons.find(
    (candidate) => candidate.frontmatter.id === state.activeLessonId,
  );
  const completed = new Set(state.completedCheckpoints[state.activeLessonId] ?? []);
  return (lesson?.frontmatter.checkpoints ?? []).find(
    (checkpoint) => !completed.has(checkpoint.id),
  )?.id;
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
  guidedState: GuidedCourseStateV1;
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
  state: GuidedCourseStateV1;
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
  state: GuidedCourseStateV1;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
  routePrefix: string;
}) {
  const [question, setQuestion] = useState("");
  const [confirmation, setConfirmation] = useState<"explore" | null>(null);
  const guidance = course.frontmatter.guidance;
  if (!guidance) return null;

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
  const initialGuidedRead = useMemo(
    () =>
      persistenceEnabled
        ? readBrowserStorage(guidedStorageKey(course))
        : { value: null, available: true },
    [course, persistenceEnabled],
  );
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
    const controllers: SandboxController[] = [];
    for (const explorable of lesson.explorables) {
      const host = document.querySelector<HTMLElement>(
        `[data-instance-id="${CSS.escape(explorable.instanceId)}"]`,
      );
      if (!host) continue;
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
            )
              dispatch({
                type: "complete",
                lessonId: lesson.frontmatter.id,
                checkpointId: checkpoint.id,
              });
          }
        },
        onError: (message) => {
          status.className = "explorable-error";
          status.setAttribute("role", "alert");
          status.textContent = `This explorable failed independently: ${message}`;
        },
      });
      host.append(status);
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
    };
  }, [lesson]);

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
    const sessionRemoved = removeBrowserStorage(courseSessionStorageKey(course));
    setPersistenceAvailable(guidedRemoved && sessionRemoved);
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
                explorables
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
        {guidance && state.mode === "guided" ? (
          <CheckpointPanel
            lesson={lesson}
            state={state}
            dispatch={dispatch}
            onRestart={(checkpointId) => {
              const restarted = restartGuidedStateFrom(
                course,
                stateRef.current,
                lesson.frontmatter.id,
                checkpointId,
              );
              stateRef.current = restarted;
              dispatch({ type: "reset", state: restarted });
              navigate(lesson.frontmatter.id);
            }}
          />
        ) : null}
        <LessonArticle html={lesson.html} title={lesson.frontmatter.title} />
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
                <small>Complete the checkpoints above to continue.</small>
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
  const firstAvailableCourse = collection.tracks
    .flatMap((track) => track.courses)
    .find((course) => course.status === "available");
  return (
    <main id="library" className="course-library">
      <header className="library-hero">
        <div className="library-masthead">
          <a className="brand" href="#/courses">
            explorables
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <p className="eyebrow library-eyebrow">Local Course Library</p>
        <h1 className="library-title">{collection.title}</h1>
        <p className="library-summary">{collection.summary}</p>
        <p className="local-note">
          Courses, exercises, and progress stay on this computer. Planned courses are
          shown so the learning path is visible without pretending they are available.
        </p>
        {firstAvailableCourse ? (
          <a
            className="library-primary-action"
            href={`#/courses/${encodeURIComponent(firstAvailableCourse.id)}`}
          >
            Start {firstAvailableCourse.title} <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </header>
      {collection.tracks.map((track, trackIndex) => (
        <section className="library-track" key={track.id} aria-labelledby={track.id}>
          <div className="track-heading">
            <div>
              <p className="track-kicker">Part {trackIndex + 1}</p>
              <h2 className="track-title" id={track.id}>
                {track.title}
              </h2>
              <p className="track-summary">{track.summary}</p>
            </div>
          </div>
          <div className="course-grid">
            {track.courses.map((course) => (
              <article
                className={`course-card course-${course.status}${
                  course.featured ? " featured-course" : ""
                }`}
                key={course.id}
              >
                <div className="course-card-heading">
                  <p className="course-status">
                    {course.status === "available" ? "Available locally" : "Planned"}
                  </p>
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
                {course.status === "available" ? (
                  <a
                    className="course-action"
                    href={`#/courses/${encodeURIComponent(course.id)}`}
                  >
                    Open course
                  </a>
                ) : (
                  <span className="planned-label">Not yet available</span>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
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
        Could not load explorables: {error}
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
    return <Lesson course={course} theme={theme} onToggleTheme={toggleTheme} />;
  return (
    <main className="loading" aria-busy="true">
      Loading explorables…
    </main>
  );
}
