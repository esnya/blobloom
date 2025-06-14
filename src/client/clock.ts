export interface MasterClock {
  request(cb: FrameRequestCallback): number;
  cancel(id: number): void;
  now(): number;
  start(): void;
  stop(): void;
}

export const createMasterClock = (): MasterClock => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let running = true;
  let tickId = 0;
  let nextId = 1;
  let current = performance.now();

  const step = (time: number): void => {
    if (!running) return;
    current = time;
    callbacks.forEach((cb) => cb(time));
    tickId = requestAnimationFrame(step);
  };

  tickId = requestAnimationFrame(step);

  return {
    request: (cb) => {
      const id = nextId++;
      callbacks.set(id, cb);
      return id;
    },
    cancel: (id) => {
      callbacks.delete(id);
    },
    now: () => current,
    start: () => {
      if (running) return;
      running = true;
      tickId = requestAnimationFrame(step);
    },
    stop: () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(tickId);
    },
  };
};

export const defaultClock = createMasterClock();
