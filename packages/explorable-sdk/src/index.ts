export type ExplorableValue =
  | null
  | boolean
  | number
  | string
  | ExplorableValue[]
  | { [key: string]: ExplorableValue };

export interface ExplorableContext {
  instanceId: string;
  lessonId: string;
  config: ExplorableValue;
  emit(event: ExplorableEvent): void;
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
  const handle = await module.mount(root, {
    instanceId: options.instanceId ?? "test-instance",
    lessonId: options.lessonId ?? "test-lesson",
    config: options.config ?? null,
    emit: (event) => events.push(event),
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
