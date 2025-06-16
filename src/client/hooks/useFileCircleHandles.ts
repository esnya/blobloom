// eslint-disable-next-line no-restricted-syntax
import { useCallback, useRef } from 'react';
import type { FileCircleHandle } from '../components/FileCircle';

export const useFileCircleHandles = () => {
  /* eslint-disable no-restricted-syntax */
  const handlesRef = useRef<Record<string, FileCircleHandle>>({});
  /* eslint-enable no-restricted-syntax */

  const register = useCallback(
    (file: string, handle: FileCircleHandle) => {
      handlesRef.current[file] = handle;
    },
    [],
  );

  const forEach = useCallback(
    (fn: (handle: FileCircleHandle) => void) => {
      Object.values(handlesRef.current).forEach(fn);
    },
    [],
  );

  const get = useCallback((file: string) => handlesRef.current[file], []);

  return { register, forEach, get } as const;
};
