import { MAX_EFFECT_CHARS } from './constants';

const pool: HTMLSpanElement[] = [];
let initialized = false;

function ensurePool(): void {
  if (initialized) return;
  for (let i = pool.length; i < MAX_EFFECT_CHARS; i += 1) {
    pool.push(document.createElement('span'));
  }
  initialized = true;
}

export function acquireSpan(): HTMLSpanElement | undefined {
  ensurePool();
  return pool.pop();
}

export function releaseSpan(el: HTMLSpanElement): void {
  el.className = '';
  el.textContent = '';
  el.removeAttribute('style');
  pool.push(el);
}

export function availableSpans(): number {
  ensurePool();
  return pool.length;
}
