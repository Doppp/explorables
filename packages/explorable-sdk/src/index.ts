export type ExplorableValue =
  | null
  | boolean
  | number
  | string
  | ExplorableValue[]
  | { [key: string]: ExplorableValue };

export const EXPERIMENT_RECORDED_EVENT = "experiment-recorded";

export type ExperimentScalar = null | boolean | number | string;

export interface ExplorableExperimentRecord {
  label?: string;
  inputs: Record<string, ExperimentScalar>;
  outputs: Record<string, ExperimentScalar>;
  summary?: string;
}

function experimentEvent(record: ExplorableExperimentRecord): ExplorableEvent {
  return {
    type: EXPERIMENT_RECORDED_EVENT,
    payload: {
      ...(record.label ? { label: record.label } : {}),
      inputs: record.inputs,
      outputs: record.outputs,
      ...(record.summary ? { summary: record.summary } : {}),
    },
  };
}

export interface ExplorableContext {
  instanceId: string;
  lessonId: string;
  config: ExplorableValue;
  emit(event: ExplorableEvent): void;
  recordExperiment(record: ExplorableExperimentRecord): void;
}

export interface ExplorableEvent {
  type: string;
  payload?: ExplorableValue;
}

export interface ExplorableHandle {
  destroy?(): void;
  resize?(width: number, height: number): void;
}

export interface ExplorableModule {
  mount(
    root: HTMLElement,
    context: ExplorableContext,
  ): ExplorableHandle | Promise<ExplorableHandle>;
}

export interface MountedExplorable {
  root: HTMLElement;
  events: ExplorableEvent[];
  handle: ExplorableHandle;
  destroy(): void;
}

export async function mountForTest(
  module: ExplorableModule,
  options: Partial<Omit<ExplorableContext, "emit">> & { root?: HTMLElement } = {},
): Promise<MountedExplorable> {
  const root = options.root ?? document.createElement("div");
  const events: ExplorableEvent[] = [];
  const emit = (event: ExplorableEvent) => events.push(event);
  const handle = await module.mount(root, {
    instanceId: options.instanceId ?? "test-instance",
    lessonId: options.lessonId ?? "test-lesson",
    config: options.config ?? null,
    emit,
    recordExperiment: (record) => emit(experimentEvent(record)),
  });
  return {
    root,
    events,
    handle,
    destroy() {
      handle.destroy?.();
      root.replaceChildren();
    },
  };
}
