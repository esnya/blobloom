// eslint-disable-next-line no-restricted-syntax
import { useEffect, useRef } from 'react';

export const usePrevious = <T>(value: T): T => {
  // eslint-disable-next-line no-restricted-syntax
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
