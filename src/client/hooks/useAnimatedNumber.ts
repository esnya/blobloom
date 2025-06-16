// eslint-disable-next-line no-restricted-syntax
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AnimatedNumberOptions {
  duration?: number;
  round?: boolean;
}

export const useAnimatedNumber = (
  initial: number,
  { duration = 300, round = false }: AnimatedNumberOptions = {},
): readonly [number, (n: number) => void] => {
  const [value, setValue] = useState(initial);
  /* eslint-disable no-restricted-syntax */
  const fromRef = useRef(initial);
  const targetRef = useRef(initial);
  const valueRef = useRef(initial);
  const startRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  /* eslint-enable no-restricted-syntax */

  const step = useCallback(
    (time: number) => {
      const linear = Math.min(1, (time - startRef.current) / duration);
      const progress = 1 - (1 - linear) ** 2;
      const next = fromRef.current + (targetRef.current - fromRef.current) * progress;
      setValue(round ? Math.round(next) : next);
      if (linear < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = targetRef.current;
        frameRef.current = null;
      }
    },
    [duration, round],
  );

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const animateTo = useCallback(
    (n: number) => {
      fromRef.current = valueRef.current;
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

