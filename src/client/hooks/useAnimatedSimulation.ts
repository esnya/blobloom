import { useEffect } from 'react';
import type { LineCount } from '../types';
import { useFileSimulation } from './useFileSimulation';

export const useAnimatedSimulation = (
  container: HTMLElement | null,
  data: LineCount[],
  opts?: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  },
) => {
  const options = opts ?? {};
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(container, options);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return { pause, resume, setEffectsEnabled } as const;
};
