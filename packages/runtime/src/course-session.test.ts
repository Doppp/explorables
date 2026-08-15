import type { RuntimeCourse } from "@explorables/course-schema";
import { describe, expect, it } from "vitest";
import {
  courseSessionStorageKey,
  createCourseSessionState,
  parseCourseSessionState,
} from "./course-session.ts";

const course = {
  root: "/course",
  frontmatter: {
    id: "course",
    title: "Course",
    version: "1.0.0",
    summary: "Course summary.",
    license: "CC-BY-4.0",
  },
  introductionHtml: "",
  lessons: [
    {
      frontmatter: { id: "one", title: "One" },
      file: "one.md",
      html: "",
      explorables: [],
      exercises: [],
      links: [],
    },
    {
      frontmatter: { id: "two", title: "Two" },
      file: "two.md",
      html: "",
      explorables: [],
      exercises: [],
      links: [],
    },
  ],
} satisfies RuntimeCourse;

describe("course session state", () => {
  it("uses a course-version-scoped key and remembers a lesson", () => {
    expect(courseSessionStorageKey(course)).toContain("course:1.0.0");
    const state = createCourseSessionState(course, "two");
    expect(parseCourseSessionState(course, JSON.stringify(state))).toMatchObject({
      activeLessonId: "two",
      courseVersion: "1.0.0",
    });
  });

  it("rejects malformed, stale, and unknown lesson state", () => {
    expect(parseCourseSessionState(course, "{broken")).toBeNull();
    expect(
      parseCourseSessionState(
        course,
        JSON.stringify({ ...createCourseSessionState(course), courseVersion: "2.0.0" }),
      ),
    ).toBeNull();
    expect(
      parseCourseSessionState(
        course,
        JSON.stringify({
          ...createCourseSessionState(course),
          activeLessonId: "absent",
        }),
      ),
    ).toBeNull();
  });
});
