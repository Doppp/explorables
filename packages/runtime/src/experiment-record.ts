import type { ExperimentRecord, ExperimentScalar } from "@explorables/course-schema";

const MAX_PAYLOAD_BYTES = 8192;
const MAX_FIELDS = 24;
const MAX_TEXT_LENGTH = 500;

function isScalar(value: unknown): value is ExperimentScalar {
  return (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.length <= MAX_TEXT_LENGTH)
  );
}

function parseFields(value: unknown): Record<string, ExperimentScalar> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (entries.length === 0 || entries.length > MAX_FIELDS) return null;
  if (
    entries.some(([key, field]) => !key.trim() || key.length > 80 || !isScalar(field))
  )
    return null;
  return Object.fromEntries(entries);
}

export function createExperimentRecord(
  payload: unknown,
  metadata: { instanceId: string; checkpointId: string },
  options: { id?: string; recordedAt?: string } = {},
): ExperimentRecord | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  try {
    if (
      new TextEncoder().encode(JSON.stringify(payload)).byteLength > MAX_PAYLOAD_BYTES
    )
      return null;
  } catch {
    return null;
  }
  const value = payload as Record<string, unknown>;
  const inputs = parseFields(value.inputs);
  const outputs = parseFields(value.outputs);
  if (!inputs || !outputs) return null;
  if (
    value.label !== undefined &&
    (typeof value.label !== "string" || value.label.length > MAX_TEXT_LENGTH)
  )
    return null;
  if (
    value.summary !== undefined &&
    (typeof value.summary !== "string" || value.summary.length > MAX_TEXT_LENGTH)
  )
    return null;
  const label = typeof value.label === "string" ? value.label : undefined;
  const summary = typeof value.summary === "string" ? value.summary : undefined;
  return {
    id: options.id ?? crypto.randomUUID(),
    checkpointId: metadata.checkpointId,
    instanceId: metadata.instanceId,
    ...(label ? { label } : {}),
    inputs,
    outputs,
    ...(summary ? { summary } : {}),
    recordedAt: options.recordedAt ?? new Date().toISOString(),
  };
}
