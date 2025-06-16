import { useCallback, useState } from 'react';
import type { SimulationOptions } from './useFileSimulation';
import { useFileSimulation } from './useFileSimulation';

export const useFileSimulationRef = (opts?: SimulationOptions) => {
  const options = opts ?? {};
  const [el, setEl] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);

  const controls = useFileSimulation(el, options);

  return { ref, ...controls };
};
