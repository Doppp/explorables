import { describe, expect, it } from "vitest";
import {
  AGENT_PLUGINS_SCHEMA_URL,
  agentPluginManifestSchema,
  agentSkillFrontmatterSchema,
  checkpointSchema,
  courseCollectionSchema,
  courseFrontmatterSchema,
  explorableAttributesSchema,
  lessonFrontmatterSchema,
} from "./index.ts";

describe("course schemas", () => {
  it("accepts the required course fields", () => {
    expect(
      courseFrontmatterSchema.parse({
        id: "small-course",
        title: "Small course",
        version: "0.1.0",
        summary: "A compact course.",
        license: "CC-BY-4.0",
      }),
    ).toMatchObject({ id: "small-course" });
  });

  it("validates Agent Plugins v1 manifests and Agent Skill metadata", () => {
    expect(
      agentPluginManifestSchema.parse({
        $schema: AGENT_PLUGINS_SCHEMA_URL,
        name: "example.course",
        version: "0.1.0",
      }),
    ).toMatchObject({ name: "example.course" });
    expect(() =>
      agentPluginManifestSchema.parse({
        $schema: AGENT_PLUGINS_SCHEMA_URL,
        name: "invalid--plugin",
      }),
    ).toThrow();
    expect(
      agentSkillFrontmatterSchema.parse({
        name: "start-course",
        description: "Start a course when the learner asks to begin.",
      }),
    ).toMatchObject({ name: "start-course" });
    expect(
      agentSkillFrontmatterSchema.parse({
        name: "a".repeat(64),
        description: "A skill whose name is at the specification limit.",
      }),
    ).toMatchObject({ name: "a".repeat(64) });
    expect(() =>
      agentSkillFrontmatterSchema.parse({
        name: "a".repeat(65),
        description: "A skill whose name exceeds the specification limit.",
      }),
    ).toThrow("must be at most 64 characters");
  });

  it("rejects unstable identifiers", () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ id: "Not Stable", title: "No" }),
    ).toThrow();
  });

  it("applies safe explorable defaults", () => {
    expect(explorableAttributesSchema.parse({ src: "../demo.ts" })).toMatchObject({
      height: 420,
      title: "Interactive explorable",
    });
  });

  it("parses opt-in guidance and both checkpoint completion mechanisms", () => {
    expect(
      courseFrontmatterSchema.parse({
        id: "guided-course",
        title: "Guided course",
        version: "0.1.0",
        summary: "A guided course.",
        license: "CC-BY-4.0",
        guidance: {},
      }).guidance,
    ).toEqual({
      defaultMode: "guided",
      allowExploreMode: true,
      allowSkipping: true,
      persistLocally: true,
      discoveryCycle: false,
    });
    expect(
      checkpointSchema.parse({
        id: "experiment",
        title: "Run the experiment",
        completion: "explorable-event",
        instanceId: "workbench",
        event: "simulation-completed",
      }),
    ).toMatchObject({ completion: "explorable-event" });
    expect(
      checkpointSchema.parse({
        id: "predict",
        title: "Make a prediction",
        phase: "predict",
        completion: "learner",
        response: {
          format: "short-text",
          prompt: "What do you expect, and why?",
        },
      }),
    ).toMatchObject({ phase: "predict", completion: "learner" });
  });

  it("parses available and planned collection entries", () => {
    const collection = courseCollectionSchema.parse({
      schemaVersion: 1,
      title: "Model learning",
      summary: "A local course collection.",
      tracks: [
        {
          id: "foundations",
          title: "Foundations",
          summary: "Build the baseline.",
          courses: [
            { status: "available", path: "examples/foundation" },
            {
              status: "planned",
              id: "inside-kimi",
              title: "Inside Kimi",
              summary: "Reconstruct the Kimi lineage.",
            },
          ],
        },
      ],
    });
    expect(collection.tracks[0]?.courses).toHaveLength(2);
  });
});
