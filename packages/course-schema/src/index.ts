import { z } from "zod";

const id = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must use lowercase kebab-case");

const agentSkillName = id.max(64, "must be at most 64 characters");

export const AGENT_PLUGINS_SCHEMA_URL =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";

const pluginName = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/,
    "must use lowercase letters, numbers, hyphens, or periods and start and end with a letter or number",
  )
  .refine((value) => !value.includes("--") && !value.includes(".."), {
    message: "must not contain consecutive hyphens or periods",
  });

export const agentPluginManifestSchema = z
  .object({
    $schema: z.literal(AGENT_PLUGINS_SCHEMA_URL),
    name: pluginName,
    version: z.string().optional(),
    description: z.string().optional(),
    author: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        url: z.string().optional(),
      })
      .strict()
      .optional(),
    homepage: z.string().optional(),
    repository: z.string().optional(),
    license: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    extensions: z.record(z.string(), z.object({}).catchall(z.unknown())).optional(),
  })
  .strict();

export const agentSkillFrontmatterSchema = z
  .object({
    name: agentSkillName,
    description: z.string().min(1).max(1024),
    license: z.string().optional(),
    compatibility: z.string().min(1).max(500).optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    "allowed-tools": z.string().optional(),
  })
  .strict();

export const courseFrontmatterSchema = z.object({
  id,
  title: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, "must be semver"),
  summary: z.string().min(1),
  license: z.string().min(1),
  audience: z.array(z.string().min(1)).optional(),
  prerequisites: z.array(z.string().min(1)).optional(),
  estimatedHours: z.number().positive().optional(),
  authors: z
    .array(z.object({ name: z.string().min(1), url: z.string().url().optional() }))
    .optional(),
  repository: z.string().url().optional(),
  language: z.string().min(2).optional(),
  tags: z.array(z.string().min(1)).optional(),
  guidance: z
    .object({
      defaultMode: z.enum(["guided", "explore"]).default("guided"),
      allowExploreMode: z.boolean().default(true),
      allowSkipping: z.boolean().default(true),
      persistLocally: z.boolean().default(true),
      discoveryCycle: z.boolean().default(false),
    })
    .optional(),
});

export const collectionTrackSchema = z.object({
  id,
  title: z.string().min(1),
  summary: z.string().min(1),
  courses: z
    .array(
      z.discriminatedUnion("status", [
        z.object({
          status: z.literal("available"),
          path: z.string().min(1),
          featured: z.boolean().optional(),
        }),
        z.object({
          status: z.literal("planned"),
          id,
          title: z.string().min(1),
          summary: z.string().min(1),
          estimatedHours: z.number().positive().optional(),
          tags: z.array(z.string().min(1)).optional(),
          featured: z.boolean().optional(),
        }),
      ]),
    )
    .min(1),
});

export const courseCollectionSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  tracks: z.array(collectionTrackSchema).min(1),
});

export const checkpointPhaseSchema = z.enum([
  "predict",
  "experiment",
  "apply",
  "reflect",
]);

export const checkpointResponseSchema = z.object({
  format: z.enum(["short-text", "long-text"]),
  prompt: z.string().min(1),
});

export const checkpointSchema = z.discriminatedUnion("completion", [
  z.object({
    id,
    title: z.string().min(1),
    phase: checkpointPhaseSchema.optional(),
    completion: z.literal("learner"),
    response: checkpointResponseSchema.optional(),
  }),
  z.object({
    id,
    title: z.string().min(1),
    phase: checkpointPhaseSchema.optional(),
    completion: z.literal("explorable-event"),
    instanceId: id,
    event: z.string().min(1),
  }),
]);

export const lessonFrontmatterSchema = z.object({
  id,
  title: z.string().min(1),
  order: z.number().int().positive().optional(),
  objectives: z.array(z.string().min(1)).optional(),
  prerequisites: z.array(z.string().min(1)).optional(),
  discoveryCycle: z.boolean().optional(),
  checkpoints: z.array(checkpointSchema).optional(),
});

export const explorableAttributesSchema = z.object({
  src: z.string().min(1),
  height: z.coerce.number().int().min(180).max(1200).default(420),
  title: z.string().min(1).default("Interactive explorable"),
  config: z.string().min(1).optional(),
  id: id.optional(),
});

export const exerciseAttributesSchema = z.object({
  path: z.string().min(1),
  command: z.string().min(1).optional(),
  title: z.string().min(1).default("Programming exercise"),
});

export const exerciseManifestSchema = z.object({
  id,
  title: z.string().min(1),
  language: z.enum(["typescript", "javascript", "python"]),
  starter: z.string().min(1),
  testCommand: z.string().min(1),
  estimatedMinutes: z.number().int().positive().optional(),
  centralFiles: z.array(z.string().min(1)).min(1),
  protectedPaths: z.array(z.string().min(1)).default([]),
});

export type CourseFrontmatter = z.infer<typeof courseFrontmatterSchema>;
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type ExplorableAttributes = z.infer<typeof explorableAttributesSchema>;
export type ExerciseAttributes = z.infer<typeof exerciseAttributesSchema>;
export type ExerciseManifest = z.infer<typeof exerciseManifestSchema>;
export type Checkpoint = z.infer<typeof checkpointSchema>;
export type Guidance = NonNullable<CourseFrontmatter["guidance"]>;
export type AgentPluginManifest = z.infer<typeof agentPluginManifestSchema>;
export type AgentSkillFrontmatter = z.infer<typeof agentSkillFrontmatterSchema>;
export type CourseCollection = z.infer<typeof courseCollectionSchema>;
export type CollectionTrack = z.infer<typeof collectionTrackSchema>;

export interface RuntimeCourseCard {
  id: string;
  title: string;
  summary: string;
  version?: string;
  estimatedHours?: number;
  lessonCount?: number;
  tags: string[];
  status: "available" | "planned";
  featured: boolean;
}

export interface RuntimeCollectionTrack {
  id: string;
  title: string;
  summary: string;
  courses: RuntimeCourseCard[];
}

export interface RuntimeCourseCollection {
  schemaVersion: 1;
  title: string;
  summary: string;
  tracks: RuntimeCollectionTrack[];
}

export interface CheckpointResponse {
  text: string;
  submittedAt?: string;
}

export type ExperimentScalar = null | boolean | number | string;

export interface ExperimentRecord {
  id: string;
  checkpointId: string;
  instanceId: string;
  label?: string;
  inputs: Record<string, ExperimentScalar>;
  outputs: Record<string, ExperimentScalar>;
  summary?: string;
  recordedAt: string;
}

export interface GuidedCourseStateV2 {
  schemaVersion: 2;
  courseId: string;
  courseVersion: string;
  mode: "guided" | "explore";
  activeLessonId: string;
  completedCheckpoints: Record<string, string[]>;
  checkpointResponses: Record<string, Record<string, CheckpointResponse>>;
  experimentRuns: Record<string, Record<string, ExperimentRecord[]>>;
  experimentBaselines: Record<string, Record<string, string>>;
  skippedLessons: string[];
  parkedQuestions: string[];
  updatedAt: string;
}

export interface CourseSessionStateV1 {
  schemaVersion: 1;
  courseId: string;
  courseVersion: string;
  activeLessonId: string;
  updatedAt: string;
}

export interface SourcePosition {
  file: string;
  line: number;
  column: number;
}

export interface ParsedExplorable {
  kind: "explorable";
  attributes: ExplorableAttributes;
  instanceId: string;
  fallbackHtml: string;
  position: SourcePosition;
}

export interface ParsedExercise {
  kind: "exercise";
  attributes: ExerciseAttributes;
  fallbackHtml: string;
  position: SourcePosition;
}

export interface ParsedLesson {
  frontmatter: LessonFrontmatter;
  file: string;
  html: string;
  explorables: ParsedExplorable[];
  exercises: ParsedExercise[];
  links: Array<{ href: string; position: SourcePosition }>;
}

export interface RuntimeExplorable extends ParsedExplorable {
  sandboxHtml: string;
}

export interface RuntimeLesson extends Omit<ParsedLesson, "explorables"> {
  explorables: RuntimeExplorable[];
}

export interface RuntimeCourse {
  root: string;
  frontmatter: CourseFrontmatter;
  introductionHtml: string;
  lessons: RuntimeLesson[];
}

export interface Diagnostic {
  severity: "error" | "warning";
  code: string;
  message: string;
  file: string;
  line: number;
  column: number;
}
