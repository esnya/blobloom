import type { LineCount } from './types.js';
import Matter from 'matter-js';
const { Bodies, Composite, Engine } = Matter;

const MIN_CIRCLE_SIZE = 1;

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

const colorForFile = (name: string): string => {
  const ext = name.slice(name.lastIndexOf('.'));
  return fileColors[ext] ?? `hsl(${hashHue(ext)},60%,60%)`;
};

interface BodyInfo {
  el: HTMLElement;
  body: Matter.Body;
  r: number;
  countEl: HTMLDivElement;
  charsEl: HTMLDivElement;
}

export const computeScale = (
  width: number,
  height: number,
  data: LineCount[],
): number => {
  const maxLines = data.reduce((m, d) => Math.max(m, d.lines), 1);
  const base = Math.min(width, height) / maxLines;
  const totalArea = data.reduce(
    (sum, f) => sum + Math.PI * ((f.lines * base) / 2) ** 2,
    0,
  );
  const ratio = totalArea / (width * height);
  const threshold = 0.2;
  if (ratio <= threshold) return base;
  const easing = Math.pow(threshold / ratio, 0.25);
  return base * easing;
};

export const createFileSimulation = (
  container: HTMLElement,
  opts: { raf?: (cb: FrameRequestCallback) => number; now?: () => number } = {},
) => {
  const raf = opts.raf ?? requestAnimationFrame;
  const now = opts.now ?? performance.now.bind(performance);
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const engine = Engine.create();
  engine.gravity.y = 1;
  engine.gravity.scale = 0.001;

  const bodies: Record<string, BodyInfo> = {};
  const prevCounts: Record<string, number> = {};

  const spawnChar = (parent: HTMLElement, cls: string): void => {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = Math.random().toString(36).charAt(2);
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 30;
    span.style.setProperty('--x', `${Math.cos(angle) * dist}px`);
    span.style.setProperty('--y', `${Math.sin(angle) * dist}px`);
    parent.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  };

  const spawnChars = (parent: HTMLElement, add: number, remove: number): void => {
    for (let i = 0; i < Math.min(add, 5); i++) spawnChar(parent, 'add-char');
    for (let i = 0; i < Math.min(remove, 5); i++) spawnChar(parent, 'remove-char');
  };
  const walls = [
    Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }),
    Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }),
    Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true }),
  ];
  Composite.add(engine.world, walls);

  const update = (data: LineCount[]): void => {
    const scale = computeScale(width, height, data);
    const names = new Set(data.map((d) => d.file));
    for (const [name, info] of Object.entries(bodies)) {
      if (!names.has(name)) {
        Composite.remove(engine.world, info.body);
        container.removeChild(info.el);
        delete bodies[name];
      }
    }
    for (const file of data) {
      const r = (file.lines * scale) / 2;
      const existing = bodies[file.file];
      const prev = prevCounts[file.file] ?? 0;
      const added = Math.max(0, file.lines - prev);
      const removed = Math.max(0, prev - file.lines);
      prevCounts[file.file] = file.lines;
      if (r * 2 < MIN_CIRCLE_SIZE) {
        if (existing) {
          Composite.remove(engine.world, existing.body);
          container.removeChild(existing.el);
          delete bodies[file.file];
        }
        continue;
      }
      if (existing) {
        const factor = r / existing.r;
        Matter.Body.scale(existing.body, factor, factor);
        existing.r = r;
        existing.el.style.width = `${r * 2}px`;
        existing.el.style.height = `${r * 2}px`;
        existing.countEl.textContent = String(file.lines);
        spawnChars(existing.charsEl, added, removed);
      } else {
        const el = document.createElement('div');
        el.className = 'file-circle';
        el.style.position = 'absolute';
        el.style.width = `${r * 2}px`;
        el.style.height = `${r * 2}px`;
        el.style.borderRadius = '50%';
        el.style.background = colorForFile(file.file);
        el.style.willChange = 'transform';
        const dir = file.file.split('/');
        const name = dir.pop() ?? '';
        const pathEl = document.createElement('div');
        pathEl.className = 'path';
        pathEl.textContent = dir.join('/') + (dir.length ? '/' : '');
        const nameEl = document.createElement('div');
        nameEl.className = 'name';
        nameEl.textContent = name;
        const countEl = document.createElement('div');
        countEl.className = 'count';
        countEl.textContent = String(file.lines);
        const charsEl = document.createElement('div');
        charsEl.className = 'chars';
        el.append(pathEl, nameEl, countEl, charsEl);
        container.appendChild(el);
        const body = Bodies.circle(
          Math.random() * (width - 2 * r) + r,
          -Math.random() * height - r,
          r,
          { restitution: 0.9, frictionAir: 0.01 },
        );
        bodies[file.file] = { el, body, r, countEl, charsEl };
        Composite.add(engine.world, body);
        spawnChars(charsEl, added, removed);
      }
    }
  };

  let frameId = 0;
  let last = now();
  const step = (time: number): void => {
    Engine.update(engine, time - last);
    last = time;
    for (const { body, el, r } of Object.values(bodies)) {
      const { x, y } = body.position;
      el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0) rotate(${body.angle}rad)`;
    }
    frameId = raf(step);
  };

  frameId = raf(step);
  const destroy = (): void => cancelAnimationFrame(frameId);
  return { update, destroy };
};

export const renderFileSimulation = (
  container: HTMLElement,
  data: LineCount[],
  opts: { raf?: (cb: FrameRequestCallback) => number; now?: () => number } = {},
): (() => void) => {
  container.innerHTML = '';
  const sim = createFileSimulation(container, opts);
  sim.update(data);
  return sim.destroy;
};
