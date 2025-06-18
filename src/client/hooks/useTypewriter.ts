import { useEffect, useState } from 'react';
import { Typewriter } from '../logic/Typewriter';

export const useTypewriter = (value: string, delay = 50): string => {
  const [text, setText] = useState(value);

  useEffect(() => {
    const inst = new Typewriter(delay, setText);
    inst.start(value);
    return () => inst.stop();
  }, [value, delay]);

  return text;
};
