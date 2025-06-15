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
  const [sim, setSim] = useState<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    const el = document.getElementById('sim');
    if (!el) return;
    const instance = createFileSimulation(el);
    setSim(instance);
    onReady?.({
      pause: instance.pause,
      resume: instance.resume,
      setEffectsEnabled: instance.setEffectsEnabled,
    });
    window.addEventListener('resize', instance.resize);
    return () => {
      window.removeEventListener('resize', instance.resize);
      instance.destroy();
    };
  }, [onReady]);

  useEffect(() => {
    if (data.length && sim) sim.update(data);
  }, [data, sim]);

  return <div id="sim" />;
}

