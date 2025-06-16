import { useEffect } from 'react';
import type { LineCount } from '../types';
import type { SimulationOptions } from './useFileSimulation';
import { useFileSimulation } from './useFileSimulation';

export const useAnimatedSimulation = (
  container: HTMLElement | null,
  data: LineCount[],
  opts?: SimulationOptions,
) => {
  const options = opts ?? {};
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(container, options);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return { pause, resume, setEffectsEnabled };
};
