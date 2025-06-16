// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useRef, useState } from 'react';
import { useFileSimulation } from '../hooks/useFileSimulation';
import type { LineCount } from '../types';

interface SimulationAreaProps {
  data: LineCount[];
}

export function SimulationArea({ data }: SimulationAreaProps): React.JSX.Element {
  /* eslint-disable no-restricted-syntax */
  const containerRef = useRef<HTMLDivElement>(null);
  /* eslint-enable no-restricted-syntax */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { update } = useFileSimulation(mounted ? containerRef.current : null);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  // eslint-disable-next-line no-restricted-syntax
  return <div ref={containerRef} />;
}

