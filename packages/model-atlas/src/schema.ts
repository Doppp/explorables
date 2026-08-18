import { z } from "zod";

const kebabId = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must use lowercase kebab-case");

export const atlasEvidenceSchema = z.enum([
  "executable",
  "configuration-derived",
  "report-derived",
  "conceptual",
  "undisclosed",
]);

export const atlasSourceSchema = z
  .object({
    id: kebabId,
    label: z.string().min(1).max(160),
    reference: z.string().min(1).max(500),
    evidence: atlasEvidenceSchema,
    revision: z.string().min(1).max(160).optional(),
  })
  .strict();

export const atlasStageSchema = z
  .object({
    id: kebabId,
    title: z.string().min(1).max(100),
    summary: z.string().min(1).max(500),
    kind: z.enum([
      "tokens",
      "embedding",
      "attention",
      "residual",
      "normalisation",
      "feed-forward",
      "router",
      "experts",
      "cache",
      "output",
      "undisclosed",
      "other",
    ]),
    evidence: atlasEvidenceSchema,
    sourceIds: z.array(kebabId).min(1).max(8),
    count: z.number().int().positive().max(1_000_000).optional(),
    dimensions: z
      .record(kebabId, z.number().int().positive().max(10_000_000))
      .optional(),
  })
  .strict();

export const modelAtlasDescriptorSchema = z
  .object({
    kind: z.literal("model-atlas"),
    schemaVersion: z.literal(1),
    id: kebabId,
    name: z.string().min(1).max(160),
    version: z.string().min(1).max(100),
    summary: z.string().min(1).max(500),
    sources: z.array(atlasSourceSchema).min(1).max(64),
    stages: z.array(atlasStageSchema).min(1).max(128),
    budgets: z
      .object({
        maxSceneObjects: z.number().int().positive().max(256).default(128),
        maxInstances: z.number().int().positive().max(20_000).default(4_096),
      })
      .strict()
      .default({ maxSceneObjects: 128, maxInstances: 4_096 }),
  })
  .strict()
  .superRefine((descriptor, context) => {
    const sourceIds = new Set(descriptor.sources.map((source) => source.id));
    const stageIds = new Set<string>();
    for (const [index, stage] of descriptor.stages.entries()) {
      if (stageIds.has(stage.id)) {
        context.addIssue({
          code: "custom",
          message: `duplicate stage id: ${stage.id}`,
          path: ["stages", index, "id"],
        });
      }
      stageIds.add(stage.id);
      for (const sourceId of stage.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: "custom",
            message: `unknown source id: ${sourceId}`,
            path: ["stages", index, "sourceIds"],
          });
        }
      }
    }
    if (descriptor.stages.length > descriptor.budgets.maxSceneObjects) {
      context.addIssue({
        code: "custom",
        message: "stage count exceeds maxSceneObjects",
        path: ["budgets", "maxSceneObjects"],
      });
    }
  });

const finiteVector = z.array(z.number().finite()).max(512);

export const modelAtlasTraceSchema = z
  .object({
    descriptorId: kebabId,
    traceId: kebabId,
    tokens: z.array(z.string().max(100)).max(512),
    steps: z
      .array(
        z
          .object({
            stageId: kebabId,
            values: z.array(finiteVector).max(512),
            rowLabels: z.array(z.string().max(100)).max(512),
            columnLabels: z.array(z.string().max(100)).max(512),
          })
          .strict(),
      )
      .max(128),
  })
  .strict();

export type AtlasEvidence = z.infer<typeof atlasEvidenceSchema>;
export type ModelAtlasDescriptor = z.infer<typeof modelAtlasDescriptorSchema>;
export type ModelAtlasTrace = z.infer<typeof modelAtlasTraceSchema>;

export function parseModelAtlasDescriptor(value: unknown): ModelAtlasDescriptor {
  return modelAtlasDescriptorSchema.parse(value);
}

export function parseModelAtlasTrace(value: unknown): ModelAtlasTrace {
  return modelAtlasTraceSchema.parse(value);
}
