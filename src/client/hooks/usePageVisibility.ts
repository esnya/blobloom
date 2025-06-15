import { useEffect, useState } from 'react';

export const usePageVisibility = (): boolean => {
  const [hidden, setHidden] = useState(document.hidden);

  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return hidden;
};
