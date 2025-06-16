import React, { useEffect, useId, useState } from 'react';
import { useFileSimulation } from '../hooks/useFileSimulation';
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
  const containerId = useId();
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEl(document.getElementById(containerId));
  }, [containerId]);
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(el);

  useEffect(() => {
    onReady?.({ pause, resume, setEffectsEnabled });
  }, [onReady, pause, resume, setEffectsEnabled]);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return <div id={containerId} />;
}

