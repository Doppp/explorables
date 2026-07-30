import type {
  Checkpoint,
  GuidedCourseStateV1,
  RuntimeCourse,
  RuntimeLesson,
} from "@explorables/course-schema";
import { mountSandbox, type SandboxController } from "@explorables/sandbox/client";
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

const LessonArticle = memo(function LessonArticle({ html }: { html: string }) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the Markdown package sanitises this HTML before it enters runtime data.
    <article dangerouslySetInnerHTML={{ __html: html }} />
  );
});

function hashLessonId(first: string): string {
  return window.location.hash.replace(/^#\/?/, "") || first;
}

function useHashLesson(course: RuntimeCourse): [string, (id: string) => void] {
  const first = course.lessons[0]?.frontmatter.id ?? "";
  const [lessonId, setLessonId] = useState(() => hashLessonId(first));
  useEffect(() => {
    const onHash = () => setLessonId(hashLessonId(first));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [first]);
  return [
    lessonId,
    (id) => {
      window.location.hash = `/${id}`;
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
        {checkpoints.map((checkpoint) => {
          const isComplete = completed.has(checkpoint.id);
          const status = checkpointStatus(checkpoint, completed, firstIncompleteId);
          return (
            <li
              className={isComplete ? "checkpoint-complete" : undefined}
              key={checkpoint.id}
            >
              <span aria-hidden="true">{isComplete ? "✓" : "○"}</span>
              <span>
                <strong>{checkpoint.title}</strong>
                <small>{status}</small>
              </span>
              {checkpoint.completion === "learner" ? (
                isComplete ? (
                  <small className="automatic-checkpoint">Recorded by learner</small>
                ) : (
                  <button
                    type="button"
                    disabled={checkpoint.id !== firstIncompleteId}
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

function GuidedTools({
  course,
  state,
  dispatch,
}: {
  course: RuntimeCourse;
  state: GuidedCourseStateV1;
  dispatch: React.Dispatch<Parameters<typeof guidedCourseReducer>[1]>;
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
    window.location.hash = `/${course.lessons[0]?.frontmatter.id ?? ""}`;
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
            window.location.hash = `/${state.activeLessonId}`;
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

function Lesson({ course }: { course: RuntimeCourse }) {
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
  const [requestedLessonId, navigate] = useHashLesson(course);
  const [navigationNotice, setNavigationNotice] = useState<string | null>(null);

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
    return () =>
      controllers.forEach((controller) => {
        controller.destroy();
      });
  }, [lesson]);

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
        <a className="brand" href="#/">
          explorables
        </a>
        <p className="course-title">{course.frontmatter.title}</p>
        <nav aria-label="Course lessons">
          <ol>
            {course.lessons.map((item) => {
              const unlocked =
                !guidance || isLessonUnlocked(course, state, item.frontmatter.id);
              const complete =
                guidance && isLessonComplete(course, state, item.frontmatter.id);
              return (
                <li key={item.frontmatter.id}>
                  {unlocked ? (
                    <a
                      aria-current={
                        item.frontmatter.id === lesson.frontmatter.id
                          ? "page"
                          : undefined
                      }
                      href={`#/${item.frontmatter.id}`}
                    >
                      {complete ? "✓ " : ""}
                      {item.frontmatter.title}
                    </a>
                  ) : (
                    <span className="locked-lesson">🔒 {item.frontmatter.title}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <GuidedTools course={course} state={state} dispatch={dispatch} />
      </aside>
      <main id="lesson" className="lesson" tabIndex={-1}>
        {navigationNotice ? (
          <p className="navigation-notice" role="status">
            {navigationNotice}
          </p>
        ) : null}
        <p className="eyebrow">
          Lesson {index + 1} of {course.lessons.length}
        </p>
        {guidance && state.mode === "guided" ? (
          <CheckpointPanel lesson={lesson} state={state} dispatch={dispatch} />
        ) : null}
        <LessonArticle html={lesson.html} />
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

export function CourseApp() {
  const [course, setCourse] = useState<RuntimeCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("./course.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Course request failed (${response.status})`);
        return response.json() as Promise<RuntimeCourse>;
      })
      .then(setCourse)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : String(reason)),
      );
  }, []);
  if (error)
    return (
      <main className="fatal-error" role="alert">
        Could not load the course: {error}
      </main>
    );
  if (!course)
    return (
      <main className="loading" aria-busy="true">
        Loading course…
      </main>
    );
  return <Lesson course={course} />;
}
