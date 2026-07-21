import type { RuntimeCourse } from "@explorables/course-schema";
import { mountSandbox, type SandboxController } from "@explorables/sandbox/client";
import { useEffect, useMemo, useState } from "react";

function useHashLesson(course: RuntimeCourse): [string, (id: string) => void] {
  const first = course.lessons[0]?.frontmatter.id ?? "";
  const initial = window.location.hash.replace(/^#\/?/, "") || first;
  const [lessonId, setLessonId] = useState(initial);
  useEffect(() => {
    const onHash = () =>
      setLessonId(window.location.hash.replace(/^#\/?/, "") || first);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [first]);
  return [lessonId, (id) => (window.location.hash = `/${id}`)];
}

function Lesson({ course }: { course: RuntimeCourse }) {
  const [lessonId, navigate] = useHashLesson(course);
  const lesson = useMemo(
    () =>
      course.lessons.find((candidate) => candidate.frontmatter.id === lessonId) ??
      course.lessons[0],
    [course.lessons, lessonId],
  );

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

  return (
    <div className="course-layout">
      <aside className="course-sidebar">
        <a className="brand" href="#/">
          explorables
        </a>
        <p className="course-title">{course.frontmatter.title}</p>
        <nav aria-label="Course lessons">
          <ol>
            {course.lessons.map((item) => (
              <li key={item.frontmatter.id}>
                <a
                  aria-current={
                    item.frontmatter.id === lesson.frontmatter.id ? "page" : undefined
                  }
                  href={`#/${item.frontmatter.id}`}
                >
                  {item.frontmatter.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <main id="lesson" className="lesson" tabIndex={-1}>
        <p className="eyebrow">
          Lesson {index + 1} of {course.lessons.length}
        </p>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the Markdown package sanitises this HTML before it enters runtime data. */}
        <article dangerouslySetInnerHTML={{ __html: lesson.html }} />
        <nav className="lesson-pagination" aria-label="Lesson pagination">
          {previous ? (
            <button type="button" onClick={() => navigate(previous.frontmatter.id)}>
              ← {previous.frontmatter.title}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button type="button" onClick={() => navigate(next.frontmatter.id)}>
              {next.frontmatter.title} →
            </button>
          ) : (
            <span>Vertical slice complete</span>
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
