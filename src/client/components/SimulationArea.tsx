import React, { useEffect } from 'react';
import { useFileSimulation } from '../hooks/useFileSimulation';
import { useMountedRef } from '../hooks/useMountedRef';
import type { LineCount } from '../types';

interface SimulationAreaProps {
  data: LineCount[];
}

export function SimulationArea({ data }: SimulationAreaProps): React.JSX.Element {
  const { ref: containerRef, element } = useMountedRef<HTMLDivElement>();
  const { update } = useFileSimulation(element);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  // eslint-disable-next-line no-restricted-syntax
  return <div ref={containerRef} />;
}

