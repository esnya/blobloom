// eslint-disable-next-line no-restricted-syntax
import { useEffect, useRef, useState } from 'react';

export const useMountedRef = <T extends HTMLElement>() => {
  // eslint-disable-next-line no-restricted-syntax
  const ref = useRef<T>(null);
  const [element, setElement] = useState<T | null>(null);

  useEffect(() => {
    setElement(ref.current);
  }, []);

  return { ref, element } as const;
};
