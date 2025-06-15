import { useCallback, useState, type DependencyList } from 'react';
import type { AnimationProps } from './useCssAnimation';

export type UseGlowAnimationResult = [(cls: string) => void, AnimationProps];

export const useGlowAnimation = (
  deps: DependencyList = [],
): UseGlowAnimationResult => {
  const [glow, setGlow] = useState('');

  /* eslint-disable react-hooks/exhaustive-deps */
  const start = useCallback((cls: string) => {
    setGlow(cls);
  }, deps);

  const onAnimationEnd = useCallback(() => {
    setGlow('');
  }, deps);
  /* eslint-enable react-hooks/exhaustive-deps */

  return [start, { className: glow, onAnimationEnd }];
};
