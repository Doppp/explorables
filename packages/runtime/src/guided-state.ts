import type { GuidedCourseStateV1, RuntimeCourse } from "@explorables/course-schema";

export type GuidedCourseAction =
  | { type: "reset"; state: GuidedCourseStateV1 }
  | { type: "complete"; lessonId: string; checkpointId: string }
  | { type: "advance"; lessonId: string }
  | { type: "skip"; lessonId: string; nextLessonId?: string }
  | { type: "set-mode"; mode: "guided" | "explore" }
  | { type: "park-question"; question: string }
  | { type: "remove-question"; index: number };

function now(): string {
  return new Date().toISOString();
}

export function guidedStorageKey(course: RuntimeCourse): string {
  return `explorables:${course.frontmatter.id}:${course.frontmatter.version}:guided-state:v1`;
}

export function createGuidedState(course: RuntimeCourse): GuidedCourseStateV1 {
  return {
    schemaVersion: 1,
    courseId: course.frontmatter.id,
    courseVersion: course.frontmatter.version,
    mode: course.frontmatter.guidance?.defaultMode ?? "guided",
    activeLessonId: course.lessons[0]?.frontmatter.id ?? "",
    completedCheckpoints: {},
    skippedLessons: [],
    parkedQuestions: [],
    updatedAt: now(),
  };
}

export function parseGuidedState(
  course: RuntimeCourse,
  serialized: string | null,
): GuidedCourseStateV1 {
  const initial = createGuidedState(course);
  if (!serialized) return initial;
  try {
    const value = JSON.parse(serialized) as Partial<GuidedCourseStateV1>;
    const lessonIds = new Set(course.lessons.map((lesson) => lesson.frontmatter.id));
    if (
      value.schemaVersion !== 1 ||
      value.courseId !== initial.courseId ||
      value.courseVersion !== initial.courseVersion ||
      !value.activeLessonId ||
      !lessonIds.has(value.activeLessonId)
    )
      return initial;
    const completedCheckpoints = Object.fromEntries(
      Object.entries(value.completedCheckpoints ?? {}).flatMap(
        ([lessonId, checkpointIds]) => {
          const lesson = course.lessons.find(
            (candidate) => candidate.frontmatter.id === lessonId,
          );
          if (!lesson || !Array.isArray(checkpointIds)) return [];
          const valid = new Set(
            (lesson.frontmatter.checkpoints ?? []).map((checkpoint) => checkpoint.id),
          );
          return [[lessonId, checkpointIds.filter((id) => valid.has(id))]];
        },
      ),
    );
    return {
      ...initial,
      mode: value.mode === "explore" ? "explore" : "guided",
      activeLessonId: value.activeLessonId,
      completedCheckpoints,
      skippedLessons: (value.skippedLessons ?? []).filter((id) => lessonIds.has(id)),
      parkedQuestions: (value.parkedQuestions ?? []).filter(
        (question): question is string =>
          typeof question === "string" && question.trim().length > 0,
      ),
      updatedAt:
        typeof value.updatedAt === "string" ? value.updatedAt : initial.updatedAt,
    };
  } catch {
    return initial;
  }
}

export function guidedCourseReducer(
  state: GuidedCourseStateV1,
  action: GuidedCourseAction,
): GuidedCourseStateV1 {
  if (action.type === "reset") return action.state;
  if (action.type === "complete") {
    const current = state.completedCheckpoints[action.lessonId] ?? [];
    if (current.includes(action.checkpointId)) return state;
    return {
      ...state,
      completedCheckpoints: {
        ...state.completedCheckpoints,
        [action.lessonId]: [...current, action.checkpointId],
      },
      updatedAt: now(),
    };
  }
  if (action.type === "advance") {
    return { ...state, activeLessonId: action.lessonId, updatedAt: now() };
  }
  if (action.type === "skip") {
    return {
      ...state,
      activeLessonId: action.nextLessonId ?? state.activeLessonId,
      skippedLessons: state.skippedLessons.includes(action.lessonId)
        ? state.skippedLessons
        : [...state.skippedLessons, action.lessonId],
      updatedAt: now(),
    };
  }
  if (action.type === "set-mode") {
    return { ...state, mode: action.mode, updatedAt: now() };
  }
  if (action.type === "park-question") {
    const question = action.question.trim();
    if (!question || state.parkedQuestions.includes(question)) return state;
    return {
      ...state,
      parkedQuestions: [...state.parkedQuestions, question],
      updatedAt: now(),
    };
  }
  return {
    ...state,
    parkedQuestions: state.parkedQuestions.filter((_, index) => index !== action.index),
    updatedAt: now(),
  };
}

export function isLessonComplete(
  course: RuntimeCourse,
  state: GuidedCourseStateV1,
  lessonId: string,
): boolean {
  const lesson = course.lessons.find(
    (candidate) => candidate.frontmatter.id === lessonId,
  );
  const checkpoints = lesson?.frontmatter.checkpoints ?? [];
  const completed = new Set(state.completedCheckpoints[lessonId] ?? []);
  return (
    state.skippedLessons.includes(lessonId) ||
    (checkpoints.length > 0 &&
      checkpoints.every((checkpoint) => completed.has(checkpoint.id)))
  );
}

export function isLessonUnlocked(
  course: RuntimeCourse,
  state: GuidedCourseStateV1,
  lessonId: string,
): boolean {
  if (state.mode === "explore") return true;
  const requested = course.lessons.findIndex(
    (lesson) => lesson.frontmatter.id === lessonId,
  );
  const active = course.lessons.findIndex(
    (lesson) => lesson.frontmatter.id === state.activeLessonId,
  );
  return requested >= 0 && requested <= Math.max(active, 0);
}
