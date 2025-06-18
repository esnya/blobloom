import { MAX_EFFECT_CHARS } from './constants';

export interface CharEffectsPool {
  acquireSpan(): HTMLSpanElement | undefined;
  releaseSpan(el: HTMLSpanElement): void;
  availableSpans(): number;
}

export const createCharEffectsPool = (): CharEffectsPool => {
  const pool: HTMLSpanElement[] = [];
  let initialized = false;

  const ensurePool = (): void => {
    if (initialized) return;
    for (let i = pool.length; i < MAX_EFFECT_CHARS; i += 1) {
      pool.push(document.createElement('span'));
    }
    initialized = true;
  };

  return {
    acquireSpan: (): HTMLSpanElement | undefined => {
      ensurePool();
      return pool.pop();
    },
    releaseSpan: (el: HTMLSpanElement): void => {
      el.className = '';
      el.textContent = '';
      el.removeAttribute('style');
      pool.push(el);
    },
    availableSpans: (): number => {
      ensurePool();
      return pool.length;
    },
  };
};

const defaultPool = createCharEffectsPool();

export const acquireSpan = (
  ...args: Parameters<CharEffectsPool['acquireSpan']>
): ReturnType<CharEffectsPool['acquireSpan']> => defaultPool.acquireSpan(...args);

export const releaseSpan = (
  ...args: Parameters<CharEffectsPool['releaseSpan']>
): ReturnType<CharEffectsPool['releaseSpan']> => defaultPool.releaseSpan(...args);

export const availableSpans = (
  ...args: Parameters<CharEffectsPool['availableSpans']>
): ReturnType<CharEffectsPool['availableSpans']> =>
  defaultPool.availableSpans(...args);
