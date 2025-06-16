// eslint-disable-next-line no-restricted-syntax
import { useCallback, useEffect, useRef, useState } from 'react';

export const useRadiusAnimation = (
  initial: number,
  duration = 300,
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
      setValue(next);
      if (linear < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = targetRef.current;
        frameRef.current = null;
      }
    },
    [duration],
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
      setValue(fromRef.current + (n - fromRef.current) * 0.1);
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
