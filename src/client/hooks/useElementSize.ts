// eslint-disable-next-line no-restricted-syntax
import { useEffect, useRef, useState } from 'react';

export const useElementSize = <T extends HTMLElement>() => {
  // eslint-disable-next-line no-restricted-syntax
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      const rect = ref.current?.getBoundingClientRect();
      setSize({ width: rect?.width ?? 0, height: rect?.height ?? 0 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return { ref, size } as const;
};
