// A stand-in for the few browser APIs the dot engines use, so their lifecycle can be tested in Node.
// installFakeDom() puts the stubs on globalThis; fakeStage and fakeCanvas build elements that count
// what is attached to them, so a test can prove destroy() left nothing behind.

type Listener = (event: unknown) => void;

export type FakeObserver = {
  kind: "resize" | "intersection";
  callback: (entries: unknown[]) => void;
  targets: unknown[];
  disconnected: boolean;
};

export type FakeContext = {
  fills: number;
  fillStyles: string[];
  fillRects: string[];
  globalAlpha: number;
  fillStyle: string;
};

type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };
const box = (left: number, top: number, width: number, height: number): Box => ({
  left, top, width, height, right: left + width, bottom: top + height,
});

function fakeContext(): FakeContext {
  const noop = () => {};
  const ctx = {
    fills: 0,
    fillStyles: [] as string[],
    fillRects: [] as string[],
    globalAlpha: 1,
    fillStyle: "",
    setTransform: noop,
    clearRect: noop,
    beginPath: noop,
    moveTo: noop,
    arc: noop,
    fillRect() { ctx.fillRects.push(String(ctx.fillStyle)); },
    fill() { ctx.fills++; ctx.fillStyles.push(String(ctx.fillStyle)); },
  };
  return ctx;
}

// Listeners come and go on this; listenerCount is what is still attached.
function listenable() {
  const listeners = new Map<string, Set<Listener>>();
  return {
    listeners,
    get listenerCount() {
      let n = 0;
      for (const set of listeners.values()) n += set.size;
      return n;
    },
    addEventListener(type: string, fn: Listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: Listener) {
      listeners.get(type)?.delete(fn);
    },
    // Calls what is attached for `type`, as the browser would.
    dispatch(type: string, event: unknown) {
      for (const fn of [...(listeners.get(type) ?? [])]) fn(event);
    },
  };
}

export function fakeCanvas(w: number, h: number) {
  const ctx = fakeContext();
  const parent = { appended: 0, append() { this.appended++; } };
  return Object.assign(listenable(), {
    clientWidth: w,
    clientHeight: h,
    width: 0,
    height: 0,
    dataset: {} as Record<string, string>,
    ctx,
    parentElement: parent,
    getContext: () => ctx,
    getBoundingClientRect: function (this: { clientWidth: number; clientHeight: number }) {
      return box(0, 0, this.clientWidth, this.clientHeight);
    },
  }) as unknown as HTMLCanvasElement & {
    ctx: FakeContext;
    listenerCount: number;
    parentElement: { appended: number };
  };
}

// A pond's stage: a canvas, the intro text (`.hero`) in the lower left, and whatever else it is told about.
// It answers only for the three things the pond is allowed to look up.
export function fakeStage(w: number, h: number) {
  const canvas = fakeCanvas(w, h);
  const stage = Object.assign(listenable(), {
    clientWidth: w,
    clientHeight: h,
    canvas,
    hero: {
      getBoundingClientRect: () => box(stage.clientWidth * 0.07, stage.clientHeight * 0.87 - 60, 300, 60),
    },
    avoid: [] as unknown[],
    getBoundingClientRect: () => box(0, 0, stage.clientWidth, stage.clientHeight),
    contains: () => true,
    querySelector(selector: string) {
      if (selector === "canvas") return canvas;
      if (selector === ".hero") return stage.hero;
      throw new Error(`the pond looked up "${selector}", which is not its own canvas, .hero or [data-avoid]`);
    },
    querySelectorAll(selector: string) {
      if (selector === "[data-avoid]") return stage.avoid;
      throw new Error(`the pond looked up "${selector}", which is not its own canvas, .hero or [data-avoid]`);
    },
  });
  return stage as unknown as HTMLElement & {
    canvas: ReturnType<typeof fakeCanvas>;
    listenerCount: number;
    dispatch(type: string, event: unknown): void;
  };
}

export function installFakeDom({ reducedMotion = false }: { reducedMotion?: boolean } = {}) {
  const frames = new Map<number, FrameRequestCallback>();
  const observers: FakeObserver[] = [];
  let nextFrame = 1;

  class FakeResizeObserver {
    record: FakeObserver;
    constructor(callback: (entries: unknown[]) => void) {
      this.record = { kind: "resize", callback, targets: [], disconnected: false };
      observers.push(this.record);
    }
    observe(target: unknown) { this.record.targets.push(target); }
    unobserve(target: unknown) { this.record.targets = this.record.targets.filter((t) => t !== target); }
    disconnect() { this.record.disconnected = true; }
  }
  class FakeIntersectionObserver extends FakeResizeObserver {
    constructor(callback: (entries: unknown[]) => void) {
      super(callback);
      this.record.kind = "intersection";
    }
  }

  Object.assign(globalThis, {
    requestAnimationFrame(callback: FrameRequestCallback) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id: number) { frames.delete(id); },
    matchMedia: (query: string) => ({ media: query, matches: reducedMotion && query.includes("prefers-reduced-motion") }),
    devicePixelRatio: 1,
    ResizeObserver: FakeResizeObserver,
    IntersectionObserver: FakeIntersectionObserver,
  });

  return {
    frames,
    observers,
    // Runs every frame that is waiting. Frames they ask for wait for the next call.
    runFrames(now: number) {
      for (const id of [...frames.keys()]) {
        const callback = frames.get(id);
        if (!callback) continue; // cancelled by an earlier frame in this batch
        frames.delete(id);
        callback(now);
      }
    },
    // Gives `target` a new size and tells whatever is watching it, as a browser does after layout.
    resize(target: { clientWidth: number; clientHeight: number }, w: number, h: number) {
      target.clientWidth = w;
      target.clientHeight = h;
      for (const o of observers) {
        if (o.kind === "resize" && !o.disconnected && o.targets.includes(target)) o.callback([{ target }]);
      }
    },
    // Tells whatever watches `target` for visibility that it came on screen, or left it.
    intersect(target: unknown, isIntersecting: boolean) {
      for (const o of observers) {
        if (o.kind === "intersection" && !o.disconnected && o.targets.includes(target)) o.callback([{ target, isIntersecting }]);
      }
    },
  };
}
