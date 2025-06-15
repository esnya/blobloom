import React, { useEffect } from 'react';
import { useFileSimulationRef } from '../hooks';
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
  const { ref, update, pause, resume, setEffectsEnabled } = useFileSimulationRef();

  useEffect(() => {
    onReady?.({ pause, resume, setEffectsEnabled });
  }, [onReady, pause, resume, setEffectsEnabled]);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return <div id="sim" ref={ref} />;
}

