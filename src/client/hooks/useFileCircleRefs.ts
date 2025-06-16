// eslint-disable-next-line no-restricted-syntax
import React, { useCallback, useRef } from 'react';

export const useFileCircleRefs = () => {
  // eslint-disable-next-line no-restricted-syntax
  const mapRef = useRef(new Map<string, React.RefObject<HTMLDivElement | null>>());

  const getRef = useCallback((file: string) => {
    let ref = mapRef.current.get(file);
    if (!ref) {
      // eslint-disable-next-line no-restricted-syntax
      ref = React.createRef<HTMLDivElement>();
      mapRef.current.set(file, ref);
    }
    return ref;
  }, []);

  const deleteRef = useCallback((file: string) => {
    mapRef.current.delete(file);
  }, []);

  return { getRef, deleteRef } as const;
};
