// eslint-disable-next-line no-restricted-syntax
import { useEffect, useRef, useState } from 'react';

export const useContainerBounds = () => {
  // eslint-disable-next-line no-restricted-syntax
  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      const rect = ref.current?.getBoundingClientRect();
      setBounds({ width: rect?.width ?? 0, height: rect?.height ?? 0 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return { ref, bounds } as const;
};
