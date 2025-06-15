import type { LineCount } from './types';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { FileCircle, type FileCircleHandle } from './components/FileCircle';
import Matter from 'matter-js';
const { Bodies, Body, Composite, Engine } = Matter;

const MIN_CIRCLE_SIZE = 1;
const CHAR_ANIMATION_MS = 1500;
export const EFFECT_DROP_THRESHOLD = 50;
export const MAX_EFFECT_CHARS = 100;

const fileColors: Record<string, string> = {
  '.ts': '#2b7489',
  '.js': '#f1e05a',
  '.json': '#292929',
  '.md': '#083fa1',
  '.html': '#e34c26',
  '.css': '#563d7c',
};

const hashHue = (s: string): number =>
  Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

const hexToHsl = (
  hex: string,
): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;
  return { h, s: s * 100, l: l * 100 };
};

const hsl = ({ h, s, l }: { h: number; s: number; l: number }): string =>
  `hsl(${h},${s}%,${l}%)`;

export const colorForFile = (name: string): string => {
  const ext = name.slice(name.lastIndexOf('.'));
  const offset = (hashHue(name) % 20) - 10;
  const base = fileColors[ext];
  if (base) {
    const { h, s, l } = hexToHsl(base);
    return hsl({ h: (h + offset + 360) % 360, s, l });
  }
  const hue = (hashHue(ext) + offset + 360) % 360;
  return `hsl(${hue},60%,60%)`;
};


interface BodyInfo {
  el: HTMLElement;
  body: Matter.Body;
  r: number;
  handle: FileCircleHandle;
  charsEl: HTMLDivElement;
  root: Root;
}

export const computeScale = (
  width: number,
  height: number,
  data: LineCount[],
  opts: { linear?: boolean } = {},
): number => {
  const exp = opts.linear ? 1 : 0.5;
  const maxLines = data.reduce(
    (m, d) => Math.max(m, Number.isFinite(d.lines) ? d.lines : 0),
    1,
  );
  const base = Math.min(width, height) / Math.pow(maxLines, exp);
  const totalArea = data.reduce(
    (sum, f) => {
      const lines = Number.isFinite(f.lines) ? f.lines : 0;
      return sum + Math.PI * ((Math.pow(lines, exp) * base) / 2) ** 2;
    },
    0,
  );
  const ratio = totalArea / (width * height);
  const threshold = 0.15;
  if (!Number.isFinite(ratio) || ratio <= threshold) return base;
  const easing = Math.pow(threshold / ratio, 0.25);
  return base * easing;
};

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
  const engine = Engine.create();
  engine.gravity.y = 1;
  engine.gravity.scale = 0.001;

  const bodies: Record<string, BodyInfo> = {};
  const prevCounts: Record<string, number> = {};
  const displayCounts: Record<string, number> = {};
  let currentData: LineCount[] = [];
  let effectsEnabled = false;
  let activeCharCount = 0;

  const spawnChar = (
    parent: HTMLElement,
    cls: string,
    offset: { x: number; y: number },
    onEnd: () => void,
    color?: string,
  ): void => {
    if (activeCharCount >= MAX_EFFECT_CHARS) {
      onEnd();
      return;
    }
    if (
      activeCharCount > EFFECT_DROP_THRESHOLD &&
      Math.random() <
        (activeCharCount - EFFECT_DROP_THRESHOLD) /
          (MAX_EFFECT_CHARS - EFFECT_DROP_THRESHOLD)
    ) {
      onEnd();
      return;
    }
    activeCharCount++;
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = Math.random().toString(36).charAt(2);
    span.style.setProperty('--x', `${offset.x}px`);
    span.style.setProperty('--y', `${offset.y}px`);
    span.style.setProperty('--rotate', `${Math.random() * 360}deg`);
    span.style.animationDelay = `${Math.random() * 0.5}s`;
    if (color) span.style.color = color;
    parent.appendChild(span);
    span.addEventListener('animationend', () => {
      span.remove();
      activeCharCount--;
      onEnd();
    });
  };

  const spawnChars = (
    info: BodyInfo,
    file: string,
    add: number,
    remove: number,
  ): void => {
    if (!effectsEnabled) {
      displayCounts[file] = (displayCounts[file] ?? 0) + add - remove;
      info.handle.setCount(displayCounts[file]);
      return;
    }
    const { x, y } = info.body.position;
    for (let i = 0; i < add; i++) {
      const offset = {
        x: Math.random() * width - x,
        y: Math.random() * height - y,
      };
      spawnChar(info.charsEl, 'add-char', offset, () => {
        displayCounts[file] = (displayCounts[file] ?? 0) + 1;
        info.handle.setCount(displayCounts[file]);
      });
    }
    for (let i = 0; i < remove; i++) {
      const offset = {
        x: Math.random() * window.innerWidth - (rect.left + x),
        y: Math.random() * window.innerHeight - (rect.top + y),
      };
      spawnChar(info.charsEl, 'remove-char', offset, () => {
        displayCounts[file] = (displayCounts[file] ?? 0) - 1;
        info.handle.setCount(displayCounts[file]);
      });
    }
  };

  const explodeAndRemove = (name: string, info: BodyInfo): void => {
    info.root.unmount();
    const count = Math.max(3, Math.floor(info.r / 5));
    // hide the circle immediately while preserving the chars container
    for (const child of Array.from(info.el.children)) {
      if (child !== info.charsEl) {
        (child as HTMLElement).style.display = 'none';
      }
    }
    info.el.style.background = 'transparent';
    for (let i = 0; i < count; i++) {
      const offset = {
        x: Math.random() * window.innerWidth - (rect.left + info.body.position.x),
        y: Math.random() * window.innerHeight - (rect.top + info.body.position.y),
      };
      spawnChar(info.charsEl, 'remove-char', offset, () => {});
    }
    Composite.remove(engine.world, info.body);
    const glow = document.createElement('div');
    glow.className = 'file-circle glow-disappear';
    glow.style.position = 'absolute';
    glow.style.width = `${info.r * 2}px`;
    glow.style.height = `${info.r * 2}px`;
    glow.style.borderRadius = '50%';
    glow.style.transform = info.el.style.transform;
    container.appendChild(glow);
    setTimeout(() => glow.remove(), 500);
    delete bodies[name];
    delete displayCounts[name];
    setTimeout(
      () => container.removeChild(info.el),
      CHAR_ANIMATION_MS + 100,
    );
  };
  const createWalls = (w: number, h: number): Matter.Body[] => [
    Bodies.rectangle(w / 2, h + 10, w, 20, { isStatic: true }),
    Bodies.rectangle(w / 2, -h - 10, w, 20, { isStatic: true }),
    Bodies.rectangle(-10, 0, 20, h * 2, { isStatic: true }),
    Bodies.rectangle(w + 10, 0, 20, h * 2, { isStatic: true }),
  ];
  let walls = createWalls(width, height);
  Composite.add(engine.world, walls);

  const update = (data: LineCount[]): void => {
    currentData = data;
    const scale = computeScale(
      width,
      height,
      data,
      opts.linear !== undefined ? { linear: opts.linear } : {},
    );
    const exp = opts.linear ? 1 : 0.5;
    const names = new Set(data.map((d) => d.file));
    for (const [name, info] of Object.entries(bodies)) {
      if (!names.has(name)) {
        explodeAndRemove(name, info);
      }
    }
    for (const file of data) {
      const lines = Number.isFinite(file.lines) ? file.lines : 0;
      const r = (Math.pow(lines, exp) * scale) / 2;
      const existing = bodies[file.file];
      const prev = prevCounts[file.file] ?? 0;
      const added = Math.max(0, lines - prev);
      const removed = Math.max(0, prev - lines);
      prevCounts[file.file] = lines;
      if (r * 2 < MIN_CIRCLE_SIZE) {
        if (existing) {
          explodeAndRemove(file.file, existing);
        }
        continue;
      }
      if (existing) {
        existing.handle.updateRadius(r);
        existing.r = r;
        spawnChars(existing, file.file, added, removed);
        if (effectsEnabled) {
          if (added > removed) existing.handle.showGlow('glow-grow');
          else if (removed > added) existing.handle.showGlow('glow-shrink');
        }
      } else {
        const el = document.createElement('div');
        let handle: FileCircleHandle | null = null;
        const root = createRoot(el);
        flushSync(() =>
          root.render(
            <FileCircle
              file={file.file}
              lines={lines}
              initialRadius={r}
              engine={engine}
              width={width}
              height={height}
              onReady={(h) => {
                handle = h;
              }}
            />,
          ),
        );
        container.appendChild(el);
        if (!handle) throw new Error('FileCircle not ready');
        const h = handle as FileCircleHandle;
        bodies[file.file] = {
          el,
          body: h.body,
          r,
          handle: h,
          charsEl: h.charsEl as HTMLDivElement,
          root,
        };
        displayCounts[file.file] = lines;
        spawnChars(bodies[file.file]!, file.file, added, removed);
        if (effectsEnabled) h.showGlow('glow-new');
      }
    }
  };

  let frameId = 0;
  let last = now();
  let running = true;
  const step = (time: number): void => {
    if (!running) return;
    Engine.update(engine, time - last);
    last = time;
    for (const { body, el, r } of Object.values(bodies)) {
      const { x, y } = body.position;
      el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0) rotate(${body.angle}rad)`;
      if (x < -r || x > width + r || y > height + r || y < -height - r) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setPosition(body, { x: Math.random() * (width - 2 * r) + r, y: -r });
      }
    }
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
    Composite.remove(engine.world, walls);
    walls = createWalls(width, height);
    Composite.add(engine.world, walls);
    if (currentData.length) update(currentData);
  };
  const destroy = (): void => {
    running = false;
    cancelAnimationFrame(frameId);
  };
  const setEffectsEnabled = (state: boolean): void => {
    effectsEnabled = state;
  };
  return { update, pause, resume, resize, destroy, setEffectsEnabled };
};

export const renderFileSimulation = (
  container: HTMLElement,
  data: LineCount[],
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
): (() => void) => {
  container.innerHTML = '';
  const sim = createFileSimulation(container, opts);
  sim.update(data);
  return sim.destroy;
};
