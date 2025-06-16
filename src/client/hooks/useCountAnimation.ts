// eslint-disable-next-line no-restricted-syntax
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCountAnimation = (
  initial: number,
  duration = 300,
): readonly [number, (n: number) => void] => {
  const [value, setValue] = useState(initial);
  /* eslint-disable no-restricted-syntax */
  const fromRef = useRef(initial);
  const targetRef = useRef(initial);
  const startRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  /* eslint-enable no-restricted-syntax */

  const step = useCallback(
    (time: number) => {
      const progress = Math.min(1, (time - startRef.current) / duration);
      const next = fromRef.current + (targetRef.current - fromRef.current) * progress;
      setValue(Math.round(next));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = targetRef.current;
        frameRef.current = null;
      }
    },
    [duration],
  );

  const animateTo = useCallback(
    (n: number) => {
      targetRef.current = n;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      startRef.current = performance.now();
      frameRef.current = requestAnimationFrame(step);
    },
    [step],
  );

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return [value, animateTo] as const;
};
