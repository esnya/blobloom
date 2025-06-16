import React, { useCallback } from 'react';

export const useFileCircleRefs = () => {
  /* eslint-disable no-restricted-syntax */
  const refs = React.useRef(new Map<string, React.RefObject<HTMLDivElement | null>>());
  /* eslint-enable no-restricted-syntax */

  const getRef = useCallback((file: string): React.RefObject<HTMLDivElement | null> => {
    let ref = refs.current.get(file);
    if (ref === undefined) {
      /* eslint-disable no-restricted-syntax */
      ref = React.createRef<HTMLDivElement>();
      /* eslint-enable no-restricted-syntax */
      refs.current.set(file, ref);
    }
    return ref;
  }, []);

  const deleteRef = useCallback((file: string): void => {
    refs.current.delete(file);
  }, []);

  return { getRef, deleteRef } as const;
};
