import type { CourseSessionStateV1, RuntimeCourse } from "@explorables/course-schema";

export function courseSessionStorageKey(course: RuntimeCourse): string {
  return `explorables:${course.frontmatter.id}:${course.frontmatter.version}:session-state:v1`;
}

export function createCourseSessionState(
  course: RuntimeCourse,
  activeLessonId = course.lessons[0]?.frontmatter.id ?? "",
): CourseSessionStateV1 {
  return {
    schemaVersion: 1,
    courseId: course.frontmatter.id,
    courseVersion: course.frontmatter.version,
    activeLessonId,
    updatedAt: new Date().toISOString(),
  };
}

export function parseCourseSessionState(
  course: RuntimeCourse,
  serialized: string | null,
): CourseSessionStateV1 | null {
  if (!serialized) return null;
  try {
    const value = JSON.parse(serialized) as Partial<CourseSessionStateV1>;
    const lessonIds = new Set(course.lessons.map((lesson) => lesson.frontmatter.id));
    if (
      value.schemaVersion !== 1 ||
      value.courseId !== course.frontmatter.id ||
      value.courseVersion !== course.frontmatter.version ||
      !value.activeLessonId ||
      !lessonIds.has(value.activeLessonId)
    )
      return null;
    return {
      schemaVersion: 1,
      courseId: value.courseId,
      courseVersion: value.courseVersion,
      activeLessonId: value.activeLessonId,
      updatedAt:
        typeof value.updatedAt === "string"
          ? value.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
