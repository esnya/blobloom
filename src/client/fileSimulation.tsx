import type { LineCount } from './types';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { FileCircleList } from './components/FileCircleSimulation';
import { PhysicsProvider } from './hooks/useEngine';
import * as Physics from './physics';

const { Engine } = Physics;

export const MAX_EFFECT_CHARS = 100;

export const createFileSimulation = (
  container: HTMLElement,
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const raf = opts.raf ?? requestAnimationFrame;
  const now = opts.now ?? performance.now.bind(performance);
  let rect = container.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;
  const engine = Engine.create(width, height);
  engine.bounds.top = -height;
  engine.gravity.y = 1;
  engine.gravity.scale = 0.002;

  const root = createRoot(container);
  let currentData: LineCount[] = [];

  const render = (): void => {
    flushSync(() =>
      root.render(
        <PhysicsProvider bounds={{ width, height }} engine={engine}>
          <FileCircleList
            data={currentData}
            bounds={{ width, height }}
            {...(opts.linear !== undefined ? { linear: opts.linear } : {})}
          />
        </PhysicsProvider>,
      ),
    );
  };

  const update = (data: LineCount[]): void => {
    currentData = data;
    render();
  };

  let frameId = 0;
  let last = now();
  let running = true;
  const step = (time: number): void => {
    if (!running) return;
    engine.update(time - last);
    last = time;
    frameId = raf(step);
  };

  frameId = raf(step);

  const pause = (): void => {
    running = false;
    cancelAnimationFrame(frameId);
  };

  const resume = (): void => {
    if (running) return;
    running = true;
    last = now();
    frameId = raf(step);
  };

  const resize = (): void => {
    rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    engine.bounds.width = width;
    engine.bounds.height = height;
    engine.bounds.top = -height;
    if (currentData.length) render();
  };

  const destroy = (): void => {
    running = false;
    cancelAnimationFrame(frameId);
    root.unmount();
  };

  return { update, pause, resume, resize, destroy };
};

