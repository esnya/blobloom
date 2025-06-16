import React, { useCallback } from 'react';

export const useCharEffectTimers = () => {
  /* eslint-disable no-restricted-syntax */
  const refs = React.useRef(new Map<string, React.RefObject<HTMLSpanElement>>());
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /* eslint-enable no-restricted-syntax */

  const spawnTimeout = useCallback(
    (id: string, delay: number, onEnd: () => void): void => {
      if (timers.current.has(id)) return;
      const timer = setTimeout(() => {
        onEnd();
        timers.current.delete(id);
      }, Math.round((1 + delay) * 1000));
      timers.current.set(id, timer);
    },
    [],
  );

  const getNodeRef = useCallback((id: string): React.RefObject<HTMLSpanElement> => {
    let ref = refs.current.get(id);
    if (!ref) {
      /* eslint-disable no-restricted-syntax */
      ref = React.createRef<HTMLSpanElement>() as React.RefObject<HTMLSpanElement>;
      /* eslint-enable no-restricted-syntax */
      refs.current.set(id, ref);
    }
    return ref;
  }, []);

  const clear = useCallback((id: string): void => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    refs.current.delete(id);
  }, []);

  React.useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
      refs.current.clear();
    },
    [],
  );

  return { spawnTimeout, getNodeRef, clear } as const;
};
