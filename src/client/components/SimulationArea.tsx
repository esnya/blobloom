import React, { useEffect, useId, useState } from 'react';
import { useFileSimulation } from '../hooks/useFileSimulation';
import type { LineCount } from '../types';

interface SimulationAreaProps {
  data: LineCount[];
}

export function SimulationArea({ data }: SimulationAreaProps): React.JSX.Element {
  const containerId = useId();
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEl(document.getElementById(containerId));
  }, [containerId]);
  const { update } = useFileSimulation(el);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return <div id={containerId} />;
}

