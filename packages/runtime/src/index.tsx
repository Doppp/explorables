import type {
  Checkpoint,
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
  createGuidedState,
  guidedCourseReducer,
  guidedStorageKey,
  isLessonComplete,
  isLessonUnlocked,
  parseGuidedState,
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
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
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
      if (!isTheme(window.localStorage.getItem(THEME_STORAGE_KEY)))
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
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
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

function hashLessonId(first: string, routePrefix = ""): string {
  const route = window.location.hash.replace(/^#\/?/, "");
  if (!routePrefix) return route || first;
  return route.startsWith(routePrefix)
    ? route.slice(routePrefix.length) || first
    : first;
}

function useHashLesson(
  course: RuntimeCourse,
  routePrefix = "",
): [string, (id: string) => void] {
  const first = course.lessons[0]?.frontmatter.id ?? "";
  const [lessonId, setLessonId] = useState(() => hashLessonId(first, routePrefix));
  useEffect(() => {
    const onHash = () => setLessonId(hashLessonId(first, routePrefix));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [first, routePrefix]);
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
}: {
  lesson: RuntimeLesson;
  state: GuidedCourseStateV1;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
}) {
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
              {checkpoint.completion === "learner" ? (
                isComplete ? (
                  <small className="automatic-checkpoint">Recorded by learner</small>
                ) : checkpoint.id === firstIncompleteId ? (
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
  const [confirmation, setConfirmation] = useState<"explore" | "reset" | null>(null);
  const guidance = course.frontmatter.guidance;
  if (!guidance) return null;

  const park = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: "park-question", question });
    setQuestion("");
  };
  const reset = () => {
    window.localStorage.removeItem(guidedStorageKey(course));
    dispatch({ type: "reset", state: createGuidedState(course) });
    window.location.hash = `/${routePrefix}${course.lessons[0]?.frontmatter.id ?? ""}`;
    setConfirmation(null);
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

      {confirmation === "reset" ? (
        <div className="mode-confirmation" role="alert">
          <p>Reset all checkpoints, skips, and parked questions for this course?</p>
          <button type="button" onClick={reset}>
            Reset progress
          </button>
          <button type="button" onClick={() => setConfirmation(null)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmation("reset")}>
          Reset local progress
        </button>
      )}
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
  const [state, dispatch] = useReducer(guidedCourseReducer, course, (currentCourse) =>
    parseGuidedState(
      currentCourse,
      currentCourse.frontmatter.guidance?.persistLocally
        ? window.localStorage.getItem(guidedStorageKey(currentCourse))
        : null,
    ),
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const sandboxControllers = useRef<SandboxController[]>([]);
  const [requestedLessonId, navigate] = useHashLesson(course, routePrefix);
  const [navigationNotice, setNavigationNotice] = useState<string | null>(null);
  const compactNavigation = useCompactNavigation();
  const compactContents = useRef<HTMLDetailsElement>(null);
  const [contentsOpen, setContentsOpen] = useState(() => !compactNavigation);

  useEffect(() => setContentsOpen(!compactNavigation), [compactNavigation]);

  useEffect(() => {
    if (!guidance?.persistLocally) return;
    window.localStorage.setItem(guidedStorageKey(course), JSON.stringify(state));
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
      <main id="lesson" className="lesson" tabIndex={-1}>
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
        {guidance && state.mode === "guided" ? (
          <CheckpointPanel lesson={lesson} state={state} dispatch={dispatch} />
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
