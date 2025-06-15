import { useCallback, useState, type DependencyList } from 'react';

export interface AnimationProps {
  className: string;
  onAnimationEnd: () => void;
}

export type UseCssAnimationResult = [() => void, AnimationProps];

export const useCssAnimation = (
  cls: string,
  deps: DependencyList = [],
): UseCssAnimationResult => {
  const [active, setActive] = useState(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  const start = useCallback(() => {
    if (!active) setActive(true);
  }, [active, ...deps]);

  const onAnimationEnd = useCallback(() => {
    if (active) setActive(false);
  }, [active, ...deps]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return [start, { className: active ? cls : '', onAnimationEnd }];
};

export const makeUseCssAnimation = (cls: string) => (
  deps: DependencyList = [],
) => useCssAnimation(cls, deps);
