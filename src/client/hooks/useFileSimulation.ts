import { useCallback, useEffect, useState } from 'react';
import { createFileSimulation } from '../fileSimulation';
import type { LineCount } from '../types';

const DEFAULT_SIM_OPTS = {} as const;

export interface SimulationOptions {
  raf?: (cb: FrameRequestCallback) => number;
  now?: () => number;
  linear?: boolean;
}

export const useFileSimulation = (
  container: HTMLElement | null,
  opts?: SimulationOptions,
) => {
  const options = opts ?? DEFAULT_SIM_OPTS;
  const [sim, setSim] = useState<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    if (!container) return;
    const instance = createFileSimulation(container, options);
    setSim(instance);
    window.addEventListener('resize', instance.resize);
    return () => {
      window.removeEventListener('resize', instance.resize);
      instance.destroy();
    };
  }, [container, options]);

  const update = useCallback((data: LineCount[]) => {
    sim?.update(data);
  }, [sim]);
  const pause = useCallback(() => sim?.pause(), [sim]);
  const resume = useCallback(() => sim?.resume(), [sim]);

  return { update, pause, resume };
};
