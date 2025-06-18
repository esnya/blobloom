import React, { useCallback } from 'react';

export const useFileCircleRefs = () => {
  // eslint-disable-next-line no-restricted-syntax
  const refs = React.useRef(
    new Map<string, React.RefObject<HTMLDivElement | null>>()
  );

  const getRef = useCallback((file: string): React.RefObject<HTMLDivElement | null> => {
    let ref = refs.current.get(file);
    if (ref === undefined) {
      ref = React.createRef<HTMLDivElement>(); // eslint-disable-line no-restricted-syntax
      refs.current.set(file, ref);
    }
    return ref;
  }, []);

  const deleteRef = useCallback((file: string): void => {
    refs.current.delete(file);
  }, []);

  return { getRef, deleteRef } as const;
};
