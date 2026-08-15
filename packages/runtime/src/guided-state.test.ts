import type { RuntimeCourse } from "@explorables/course-schema";
import { describe, expect, it } from "vitest";
import {
  createGuidedState,
  guidedCourseReducer,
  guidedStorageKey,
  isLessonComplete,
  isLessonUnlocked,
  parseGuidedState,
  restartGuidedStateFrom,
} from "./guided-state.ts";

const course = {
  root: "/course",
  frontmatter: {
    id: "guided-course",
    title: "Guided course",
    version: "1.0.0",
    summary: "Learn in order.",
    license: "CC-BY-4.0",
    guidance: {
      defaultMode: "guided",
      allowExploreMode: true,
      allowSkipping: true,
      persistLocally: true,
    },
  },
  introductionHtml: "",
  lessons: [
    {
      frontmatter: {
        id: "one",
        title: "One",
        checkpoints: [
          { id: "predict", title: "Predict", completion: "learner" },
          {
            id: "experiment",
            title: "Experiment",
            completion: "explorable-event",
            instanceId: "demo",
            event: "simulation-completed",
          },
        ],
      },
      file: "one.md",
      html: "",
      explorables: [],
      exercises: [],
      links: [],
    },
    {
      frontmatter: { id: "two", title: "Two", checkpoints: [] },
      file: "two.md",
      html: "",
      explorables: [],
      exercises: [],
      links: [],
    },
  ],
} satisfies RuntimeCourse;

describe("guided course state", () => {
  it("creates versioned local state and locks future lessons", () => {
    const state = createGuidedState(course);
    expect(guidedStorageKey(course)).toContain("guided-course:1.0.0");
    expect(isLessonUnlocked(course, state, "one")).toBe(true);
    expect(isLessonUnlocked(course, state, "two")).toBe(false);
  });

  it("completes checkpoints, advances, skips, and changes mode", () => {
    let state = createGuidedState(course);
    state = guidedCourseReducer(state, {
      type: "complete",
      lessonId: "one",
      checkpointId: "predict",
    });
    state = guidedCourseReducer(state, {
      type: "complete",
      lessonId: "one",
      checkpointId: "experiment",
    });
    expect(isLessonComplete(course, state, "one")).toBe(true);
    state = guidedCourseReducer(state, { type: "advance", lessonId: "two" });
    expect(isLessonUnlocked(course, state, "two")).toBe(true);
    state = guidedCourseReducer(state, { type: "set-mode", mode: "explore" });
    expect(state.mode).toBe("explore");
  });

  it("recovers safely from malformed, stale, and partially invalid storage", () => {
    const { updatedAt, ...recovered } = parseGuidedState(course, "{broken");
    const { updatedAt: _initialUpdatedAt, ...initial } = createGuidedState(course);
    expect(recovered).toEqual(initial);
    expect(Number.isNaN(Date.parse(updatedAt))).toBe(false);
    const stale = { ...createGuidedState(course), courseVersion: "0.9.0" };
    expect(parseGuidedState(course, JSON.stringify(stale)).courseVersion).toBe("1.0.0");
    const stored = {
      ...createGuidedState(course),
      completedCheckpoints: { one: ["predict", "unknown"] },
      parkedQuestions: ["Later topic", "", 1],
    };
    expect(parseGuidedState(course, JSON.stringify(stored))).toMatchObject({
      completedCheckpoints: { one: ["predict"] },
      parkedQuestions: ["Later topic"],
    });
  });

  it("maintains a local question parking lot", () => {
    let state = createGuidedState(course);
    state = guidedCourseReducer(state, {
      type: "park-question",
      question: "  What comes later? ",
    });
    expect(state.parkedQuestions).toEqual(["What comes later?"]);
    state = guidedCourseReducer(state, { type: "remove-question", index: 0 });
    expect(state.parkedQuestions).toEqual([]);
  });

  it("restarts from a checkpoint without disturbing earlier progress", () => {
    const progressed = {
      ...createGuidedState(course),
      activeLessonId: "two",
      completedCheckpoints: { one: ["predict", "experiment"], two: ["later"] },
      skippedLessons: ["two"],
    };
    const restarted = restartGuidedStateFrom(course, progressed, "one", "experiment");
    expect(restarted).toMatchObject({
      mode: "guided",
      activeLessonId: "one",
      completedCheckpoints: { one: ["predict"] },
      skippedLessons: [],
    });
  });
});
