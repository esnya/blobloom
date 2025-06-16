import { useEffect, useState } from 'react';

export const useTypewriter = (text: string, msPerChar = 40): string => {
  const [value, setValue] = useState(text);

  useEffect(() => {
    let i = 0;
    setValue('');
    const id = setInterval(() => {
      i += 1;
      setValue(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
      }
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar]);

  return value;
};
