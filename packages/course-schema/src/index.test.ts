import { describe, expect, it } from "vitest";
import {
  courseFrontmatterSchema,
  checkpointSchema,
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
  });
});
