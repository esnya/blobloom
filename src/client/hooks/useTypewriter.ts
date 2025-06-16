// eslint-disable-next-line no-restricted-syntax
import { useEffect, useRef, useState } from 'react';

export const useTypewriter = (value: string, delay = 50): string => {
  const [text, setText] = useState(value);
  /* eslint-disable no-restricted-syntax */
  const prevRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* eslint-enable no-restricted-syntax */

  useEffect(() => {
    if (prevRef.current === value) return;
    let index = 0;
    prevRef.current = value;
    setText('');

    const tick = (): void => {
      index += 1;
      setText(value.slice(0, index));
      if (index < value.length) {
        timerRef.current = setTimeout(tick, delay);
      }
    };

    timerRef.current = setTimeout(tick, delay);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return text;
};
