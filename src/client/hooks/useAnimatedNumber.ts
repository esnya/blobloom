// eslint-disable-next-line no-restricted-syntax
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatedNumber, AnimatedNumberOptions } from '../logic/AnimatedNumber';

export const useAnimatedNumber = (
  initial: number,
  { duration = 300, round = false }: AnimatedNumberOptions = {},
): readonly [number, (n: number) => void] => {
  const [value, setValue] = useState(initial);
  // eslint-disable-next-line no-restricted-syntax
  const controllerRef = useRef<AnimatedNumber | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new AnimatedNumber(initial, { duration, round }, setValue);
  } else {
    controllerRef.current.updateOptions({ duration, round });
  }

  useEffect(() => () => controllerRef.current?.cancel(), []);

  const animateTo = useCallback((n: number) => controllerRef.current?.animateTo(n), []);

  return [value, animateTo] as const;
};

