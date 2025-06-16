import { useCallback, useState } from 'react';
import { useFileSimulation } from './useFileSimulation';

export const useFileSimulationRef = (
  opts?: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  },
) => {
  const options = opts ?? {};
  const [el, setEl] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);

  const controls = useFileSimulation(el, options);

  return { ref, ...controls } as const;
};
