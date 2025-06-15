import { useGlowAnimation } from './useGlowAnimation';

export const useGlowControl = () => {
  const [startGlow, glowProps] = useGlowAnimation();
  return { startGlow, glowProps } as const;
};
