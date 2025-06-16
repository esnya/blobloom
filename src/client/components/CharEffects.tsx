import React from 'react';
import type { CharEffects } from '../hooks/useCharEffects';
import { acquireSpan, releaseSpan } from '../charEffectsPool';

export interface CharEffectsProps {
  effects: CharEffects;
}

export function CharEffects({ effects }: CharEffectsProps): React.JSX.Element {
  const { chars, removeChar } = effects;

  /* eslint-disable no-restricted-syntax */
  const containerRef = React.useRef<HTMLDivElement>(null);
  const active = React.useRef(new Map<string, HTMLSpanElement>());
  /* eslint-enable no-restricted-syntax */

  React.useEffect(() => {
    const map = active.current;
    return () => {
      map.forEach((el) => {
        el.remove();
        releaseSpan(el);
      });
      map.clear();
    };
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    chars.forEach((c) => {
      if (active.current.has(c.id)) return;
      const el = acquireSpan();
      if (!el) {
        removeChar(c.id);
        return;
      }
      active.current.set(c.id, el);
      el.className = c.cls;
      el.textContent = c.char;
      el.style.setProperty('--x', `${c.offset.x}px`);
      el.style.setProperty('--y', `${c.offset.y}px`);
      el.style.setProperty('--rotate', c.rotate);
      el.style.animationDelay = `${c.delay}s`;
      if (c.color) el.style.color = c.color;

      const onEnd = () => {
        el.removeEventListener('animationend', onEnd);
        active.current.delete(c.id);
        releaseSpan(el);
        removeChar(c.id);
        c.onEnd();
      };

      el.addEventListener('animationend', onEnd);
      container.appendChild(el);
    });
  }, [chars, removeChar]);

  return (
    <div
      className="chars"
      // eslint-disable-next-line no-restricted-syntax
      ref={containerRef}
    />
  );
}
