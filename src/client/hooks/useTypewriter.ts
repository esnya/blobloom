import { useEffect, useState } from 'react';

export const useTypewriter = (
  text: string,
  speed = 40,
): string => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return display;
};

