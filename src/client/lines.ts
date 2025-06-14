import type { LineCount } from './types';
import { Bodies, Composite, Engine } from 'matter-js';

export const fetchLineCounts = async (
  json: (input: string) => Promise<unknown>,
  timestamp?: number,
): Promise<LineCount[]> => {
  const url = timestamp ? `/api/lines?ts=${timestamp}` : '/api/lines';
  return (await json(url)) as LineCount[];
};


interface BodyInfo {
  el: HTMLElement;
  body: Matter.Body;
  r: number;
}

export const renderFileSimulation = (
  container: HTMLElement,
  data: LineCount[],
  opts: { raf?: (cb: FrameRequestCallback) => number; now?: () => number } = {},
): (() => void) => {
  const raf = opts.raf ?? requestAnimationFrame;
  const now = opts.now ?? performance.now.bind(performance);
  container.innerHTML = '';
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const maxLines = data[0]?.lines ?? 1;
  const scale = Math.min(width, height) / maxLines;

  const engine = Engine.create();
  engine.gravity.scale = 0;

  const bodies: BodyInfo[] = [];
  for (const file of data) {
    const r = (file.lines * scale) / 2;
    const el = document.createElement('div');
    el.className = 'file-circle';
    el.style.position = 'absolute';
    el.style.width = `${r * 2}px`;
    el.style.height = `${r * 2}px`;
    el.style.borderRadius = '50%';
    el.style.background = 'steelblue';
    el.style.willChange = 'transform';
    container.appendChild(el);
    const body = Bodies.circle(
      Math.random() * (width - 2 * r) + r,
      Math.random() * (height - 2 * r) + r,
      r,
      { restitution: 0.9, frictionAir: 0.01 },
    );
    bodies.push({ el, body, r });
    Composite.add(engine.world, body);
  }

  const walls = [
    Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }),
    Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }),
    Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }),
    Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true }),
  ];
  Composite.add(engine.world, walls);

  let frameId = 0;
  let last = now();
  const step = (time: number) => {
    Engine.update(engine, time - last);
    last = time;
    for (const { body, el, r } of bodies) {
      const { x, y } = body.position;
      el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0) rotate(${body.angle}rad)`;
    }
    frameId = raf(step);
  };

  frameId = raf(step);
  return () => cancelAnimationFrame(frameId);
};
