import { useAnimatedNumber } from './useAnimatedNumber';

export const useRadiusAnimation = (
  initial: number,
  duration = 300,
) => useAnimatedNumber(initial, { duration });
