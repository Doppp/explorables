import type {
  CheckpointResponse,
  ExperimentRecord,
  ExperimentScalar,
  GuidedCourseStateV2,
  RuntimeCourse,
} from "@explorables/course-schema";

export const MAX_EXPERIMENT_RUNS = 20;

type StoredGuidedState = Omit<Partial<GuidedCourseStateV2>, "schemaVersion"> & {
  schemaVersion?: number;
};

export type GuidedCourseAction =
  | { type: "reset"; state: GuidedCourseStateV2 }
  | { type: "complete"; lessonId: string; checkpointId: string }
  | {
      type: "set-response";
      lessonId: string;
      checkpointId: string;
      text: string;
    }
  | { type: "submit-response"; lessonId: string; checkpointId: string }
  | { type: "record-experiment"; lessonId: string; record: ExperimentRecord }
  | {
      type: "set-experiment-baseline";
      lessonId: string;
      instanceId: string;
      recordId: string;
    }
  | { type: "advance"; lessonId: string }
  | { type: "skip"; lessonId: string; nextLessonId?: string }
  | { type: "set-mode"; mode: "guided" | "explore" }
  | { type: "park-question"; question: string }
  | { type: "remove-question"; index: number };

function now(): string {
  return new Date().toISOString();
}

function isScalar(value: unknown): value is ExperimentScalar {
  return (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.length <= 500)
  );
}

function scalarRecord(value: unknown): value is Record<string, ExperimentScalar> {
  const entries =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? Object.entries(value)
      : [];
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    entries.length > 0 &&
    entries.length <= 24 &&
    entries.every(
      ([key, field]) => key.trim().length > 0 && key.length <= 80 && isScalar(field),
    )
  );
}

function parseCheckpointResponses(
  course: RuntimeCourse,
  value: StoredGuidedState,
): GuidedCourseStateV2["checkpointResponses"] {
  return Object.fromEntries(
    Object.entries(value.checkpointResponses ?? {}).flatMap(([lessonId, responses]) => {
      const lesson = course.lessons.find(
        (candidate) => candidate.frontmatter.id === lessonId,
      );
      if (!lesson || !responses || typeof responses !== "object") return [];
      const valid = new Set(
        (lesson.frontmatter.checkpoints ?? []).map((checkpoint) => checkpoint.id),
      );
      const parsed = Object.fromEntries(
        Object.entries(responses).flatMap(([checkpointId, response]) => {
          if (
            !valid.has(checkpointId) ||
            !response ||
            typeof response !== "object" ||
            typeof response.text !== "string"
          )
            return [];
          const next: CheckpointResponse = { text: response.text.slice(0, 4000) };
          if (typeof response.submittedAt === "string")
            next.submittedAt = response.submittedAt;
          return [[checkpointId, next]];
        }),
      );
      return Object.keys(parsed).length > 0 ? [[lessonId, parsed]] : [];
    }),
  );
}

function parseExperimentRuns(
  course: RuntimeCourse,
  value: StoredGuidedState,
): GuidedCourseStateV2["experimentRuns"] {
  return Object.fromEntries(
    Object.entries(value.experimentRuns ?? {}).flatMap(([lessonId, byInstance]) => {
      const lesson = course.lessons.find(
        (candidate) => candidate.frontmatter.id === lessonId,
      );
      if (!lesson || !byInstance || typeof byInstance !== "object") return [];
      const instanceIds = new Set(
        lesson.explorables.map((explorable) => explorable.instanceId),
      );
      const checkpointIds = new Set(
        (lesson.frontmatter.checkpoints ?? []).map((checkpoint) => checkpoint.id),
      );
      const parsed = Object.fromEntries(
        Object.entries(byInstance).flatMap(([instanceId, records]) => {
          if (!instanceIds.has(instanceId) || !Array.isArray(records)) return [];
          const valid = records.filter(
            (record): record is ExperimentRecord =>
              Boolean(record) &&
              typeof record === "object" &&
              typeof record.id === "string" &&
              typeof record.checkpointId === "string" &&
              checkpointIds.has(record.checkpointId) &&
              record.instanceId === instanceId &&
              typeof record.recordedAt === "string" &&
              (record.label === undefined ||
                (typeof record.label === "string" && record.label.length <= 500)) &&
              (record.summary === undefined ||
                (typeof record.summary === "string" && record.summary.length <= 500)) &&
              scalarRecord(record.inputs) &&
              scalarRecord(record.outputs),
          );
          return valid.length > 0
            ? [[instanceId, valid.slice(-MAX_EXPERIMENT_RUNS)]]
            : [];
        }),
      );
      return Object.keys(parsed).length > 0 ? [[lessonId, parsed]] : [];
    }),
  );
}

function parseExperimentBaselines(
  runs: GuidedCourseStateV2["experimentRuns"],
  value: GuidedCourseStateV2["experimentBaselines"] | undefined,
): GuidedCourseStateV2["experimentBaselines"] {
  return Object.fromEntries(
    Object.entries(value ?? {}).flatMap(([lessonId, byInstance]) => {
      if (!byInstance || typeof byInstance !== "object") return [];
      const parsed = Object.fromEntries(
        Object.entries(byInstance).filter(([instanceId, recordId]) =>
          (runs[lessonId]?.[instanceId] ?? []).some((record) => record.id === recordId),
        ),
      );
      return Object.keys(parsed).length > 0 ? [[lessonId, parsed]] : [];
    }),
  );
}

export function guidedStorageKey(course: RuntimeCourse): string {
  return `explorables:${course.frontmatter.id}:${course.frontmatter.version}:guided-state:v2`;
}

export function legacyGuidedStorageKey(course: RuntimeCourse): string {
  return `explorables:${course.frontmatter.id}:${course.frontmatter.version}:guided-state:v1`;
}

export function createGuidedState(course: RuntimeCourse): GuidedCourseStateV2 {
  return {
    schemaVersion: 2,
    courseId: course.frontmatter.id,
    courseVersion: course.frontmatter.version,
    mode: course.frontmatter.guidance?.defaultMode ?? "guided",
    activeLessonId: course.lessons[0]?.frontmatter.id ?? "",
    completedCheckpoints: {},
    checkpointResponses: {},
    experimentRuns: {},
    experimentBaselines: {},
    skippedLessons: [],
    parkedQuestions: [],
    updatedAt: now(),
  };
}

export function parseGuidedState(
  course: RuntimeCourse,
  serialized: string | null,
): GuidedCourseStateV2 {
  const initial = createGuidedState(course);
  if (!serialized) return initial;
  try {
    const value = JSON.parse(serialized) as StoredGuidedState;
    const lessonIds = new Set(course.lessons.map((lesson) => lesson.frontmatter.id));
    if (
      (value.schemaVersion !== 1 && value.schemaVersion !== 2) ||
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
    const checkpointResponses = parseCheckpointResponses(course, value);
    const experimentRuns = parseExperimentRuns(course, value);
    const experimentBaselines = parseExperimentBaselines(
      experimentRuns,
      value.experimentBaselines,
    );
    return {
      ...initial,
      mode: value.mode === "explore" ? "explore" : "guided",
      activeLessonId: value.activeLessonId,
      completedCheckpoints,
      checkpointResponses,
      experimentRuns,
      experimentBaselines,
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
  state: GuidedCourseStateV2,
  action: GuidedCourseAction,
): GuidedCourseStateV2 {
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
  if (action.type === "set-response") {
    const lesson = state.checkpointResponses[action.lessonId] ?? {};
    const existing = lesson[action.checkpointId];
    if (existing?.submittedAt) return state;
    return {
      ...state,
      checkpointResponses: {
        ...state.checkpointResponses,
        [action.lessonId]: {
          ...lesson,
          [action.checkpointId]: { text: action.text.slice(0, 4000) },
        },
      },
      updatedAt: now(),
    };
  }
  if (action.type === "submit-response") {
    const lessonResponses = state.checkpointResponses[action.lessonId] ?? {};
    const response = lessonResponses[action.checkpointId];
    const text = response?.text.trim() ?? "";
    if (!text || response?.submittedAt) return state;
    const current = state.completedCheckpoints[action.lessonId] ?? [];
    return {
      ...state,
      completedCheckpoints: current.includes(action.checkpointId)
        ? state.completedCheckpoints
        : {
            ...state.completedCheckpoints,
            [action.lessonId]: [...current, action.checkpointId],
          },
      checkpointResponses: {
        ...state.checkpointResponses,
        [action.lessonId]: {
          ...lessonResponses,
          [action.checkpointId]: { text, submittedAt: now() },
        },
      },
      updatedAt: now(),
    };
  }
  if (action.type === "record-experiment") {
    const lessonRuns = state.experimentRuns[action.lessonId] ?? {};
    const runs = lessonRuns[action.record.instanceId] ?? [];
    return {
      ...state,
      experimentRuns: {
        ...state.experimentRuns,
        [action.lessonId]: {
          ...lessonRuns,
          [action.record.instanceId]: [...runs, action.record].slice(
            -MAX_EXPERIMENT_RUNS,
          ),
        },
      },
      updatedAt: now(),
    };
  }
  if (action.type === "set-experiment-baseline") {
    return {
      ...state,
      experimentBaselines: {
        ...state.experimentBaselines,
        [action.lessonId]: {
          ...(state.experimentBaselines[action.lessonId] ?? {}),
          [action.instanceId]: action.recordId,
        },
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
  state: GuidedCourseStateV2,
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
  state: GuidedCourseStateV2,
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

export function restartGuidedStateFrom(
  course: RuntimeCourse,
  state: GuidedCourseStateV2,
  lessonId: string,
  checkpointId: string,
): GuidedCourseStateV2 {
  const lessonIndex = course.lessons.findIndex(
    (lesson) => lesson.frontmatter.id === lessonId,
  );
  const lesson = course.lessons[lessonIndex];
  const checkpointIndex = (lesson?.frontmatter.checkpoints ?? []).findIndex(
    (checkpoint) => checkpoint.id === checkpointId,
  );
  if (!lesson || lessonIndex < 0 || checkpointIndex < 0) return state;

  const earlierLessonIds = new Set(
    course.lessons.slice(0, lessonIndex).map((item) => item.frontmatter.id),
  );
  const priorCheckpointIds = new Set(
    (lesson.frontmatter.checkpoints ?? [])
      .slice(0, checkpointIndex)
      .map((checkpoint) => checkpoint.id),
  );
  const completedCheckpoints = Object.fromEntries(
    Object.entries(state.completedCheckpoints).flatMap(([completedLessonId, ids]) => {
      if (earlierLessonIds.has(completedLessonId)) return [[completedLessonId, ids]];
      if (completedLessonId !== lessonId) return [];
      const retained = ids.filter((id) => priorCheckpointIds.has(id));
      return retained.length > 0 ? [[completedLessonId, retained]] : [];
    }),
  );
  const checkpointResponses = Object.fromEntries(
    Object.entries(state.checkpointResponses).flatMap(
      ([responseLessonId, responses]) => {
        if (earlierLessonIds.has(responseLessonId))
          return [[responseLessonId, responses]];
        if (responseLessonId !== lessonId) return [];
        const retained = Object.fromEntries(
          Object.entries(responses).filter(([id]) => priorCheckpointIds.has(id)),
        );
        return Object.keys(retained).length > 0 ? [[responseLessonId, retained]] : [];
      },
    ),
  );
  const experimentRuns = Object.fromEntries(
    Object.entries(state.experimentRuns).flatMap(([runLessonId, byInstance]) => {
      if (earlierLessonIds.has(runLessonId)) return [[runLessonId, byInstance]];
      if (runLessonId !== lessonId) return [];
      const retained = Object.fromEntries(
        Object.entries(byInstance).flatMap(([instanceId, records]) => {
          const filtered = records.filter((record) =>
            priorCheckpointIds.has(record.checkpointId),
          );
          return filtered.length > 0 ? [[instanceId, filtered]] : [];
        }),
      );
      return Object.keys(retained).length > 0 ? [[runLessonId, retained]] : [];
    }),
  );

  return {
    ...state,
    mode: "guided",
    activeLessonId: lessonId,
    completedCheckpoints,
    checkpointResponses,
    experimentRuns,
    experimentBaselines: parseExperimentBaselines(
      experimentRuns,
      state.experimentBaselines,
    ),
    skippedLessons: state.skippedLessons.filter((id) => earlierLessonIds.has(id)),
    updatedAt: now(),
  };
}
