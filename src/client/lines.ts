import type { LineCount } from './types';

export const fetchLineCounts = async (
  json: (input: string) => Promise<unknown>,
  timestamp?: number,
): Promise<LineCount[]> => {
  const url = timestamp ? `/api/lines?ts=${timestamp}` : '/api/lines';
  return (await json(url)) as LineCount[];
};

interface Body {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  av: number;
  mass: number;
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

  const bodies: Body[] = [];
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
    bodies.push({
      el,
      x: Math.random() * (width - 2 * r) + r,
      y: Math.random() * (height - 2 * r) + r,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      r,
      angle: 0,
      av: (Math.random() - 0.5) * 2,
      mass: r * r,
    });
  }

  let frameId = 0;
  let last = now();

  const step = (time: number) => {
    const dt = (time - last) / 1000;
    last = time;

    for (const b of bodies) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.angle += b.av * dt;

      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx = Math.abs(b.vx);
        b.av *= 0.9;
      } else if (b.x + b.r > width) {
        b.x = width - b.r;
        b.vx = -Math.abs(b.vx);
        b.av *= 0.9;
      }
      if (b.y - b.r < 0) {
        b.y = b.r;
        b.vy = Math.abs(b.vy);
        b.av *= 0.9;
      } else if (b.y + b.r > height) {
        b.y = height - b.r;
        b.vy = -Math.abs(b.vy);
        b.av *= 0.9;
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.r + b.r;
        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          a.x -= (nx * overlap) / 2;
          a.y -= (ny * overlap) / 2;
          b.x += (nx * overlap) / 2;
          b.y += (ny * overlap) / 2;
          const dvx = b.vx - a.vx;
          const dvy = b.vy - a.vy;
          const vn = dvx * nx + dvy * ny;
          if (vn < 0) {
            const impulse = (2 * vn) / (a.mass + b.mass);
            a.vx += impulse * b.mass * nx;
            a.vy += impulse * b.mass * ny;
            b.vx -= impulse * a.mass * nx;
            b.vy -= impulse * a.mass * ny;
            const vt = -dvy * nx + dvx * ny;
            a.av -= (vt / a.r) * 0.1;
            b.av += (vt / b.r) * 0.1;
          }
        }
      }
    }

    for (const b of bodies) {
      b.vx *= 0.999;
      b.vy *= 0.999;
      b.av *= 0.99;
      b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${b.angle}rad)`;
    }
    frameId = raf(step);
  };

  frameId = raf(step);
  return () => cancelAnimationFrame(frameId);
};
