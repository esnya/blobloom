import React, { useEffect, useState } from 'react';
import { createFileSimulation } from '../lines';
import type { LineCount } from '../types';

export interface SimulationAreaHandle {
  pause: () => void;
  resume: () => void;
  setEffectsEnabled: (state: boolean) => void;
}

interface SimulationAreaProps {
  data: LineCount[];
  onReady?: (handle: SimulationAreaHandle) => void;
}

export function SimulationArea({ data, onReady }: SimulationAreaProps): React.JSX.Element {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [sim, setSim] = useState<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    if (!containerEl) return;
    const s = createFileSimulation(containerEl);
    setSim(s);
    window.addEventListener('resize', s.resize);
    return () => {
      window.removeEventListener('resize', s.resize);
      s.destroy();
    };
  }, [containerEl]);

  useEffect(() => {
    if (data.length) sim?.update(data);
  }, [data, sim]);

  const pause = (): void => sim?.pause();
  const resume = (): void => sim?.resume();
  const setEffectsEnabled = (state: boolean): void => sim?.setEffectsEnabled(state);

  useEffect(() => {
    onReady?.({ pause, resume, setEffectsEnabled });
  }, [pause, resume, setEffectsEnabled, onReady]);

  return <div id="sim" ref={setContainerEl} />;
}
