import { useAnimatedNumber } from './useAnimatedNumber';

export const useCountAnimation = (
  initial: number,
  duration = 300,
) => useAnimatedNumber(initial, { duration, round: true });
