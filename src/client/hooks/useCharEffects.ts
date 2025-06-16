import { useCallback, useState } from 'react';

interface CharEffect {
  id: string;
  cls: string;
  char: string;
  offset: { x: number; y: number };
  rotate: string;
  delay: number;
  color?: string;
  onEnd: () => void;
}

export interface CharEffects {
  chars: CharEffect[];
  spawnChar: (
    cls: string,
    offset: { x: number; y: number },
    onEnd: () => void,
    color?: string,
  ) => void;
  removeChar: (id: string) => void;
}

export const useCharEffects = (): CharEffects => {
  const [chars, setChars] = useState<CharEffect[]>([]);

  const removeChar = useCallback((id: string): void => {
    setChars((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const spawnChar = useCallback(
    (
      cls: string,
      offset: { x: number; y: number },
      onEnd: () => void,
      color?: string,
    ): void => {
      const effect: CharEffect = {
        id: Math.random().toString(36).slice(2),
        cls,
        char: Math.random().toString(36).charAt(2),
        offset,
        rotate: `${Math.random() * 360}deg`,
        delay: Math.random() * 0.25,
        onEnd,
        ...(color ? { color } : {}),
      };
      setChars((prev) => [...prev, effect]);
    },
    [],
  );

  return { chars, spawnChar, removeChar };
};
