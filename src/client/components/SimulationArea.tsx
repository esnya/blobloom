import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useAnimatedSimulation } from '../hooks';
import type { LineCount } from '../types';

export interface SimulationAreaHandle {
  pause: () => void;
  resume: () => void;
  setEffectsEnabled: (state: boolean) => void;
}

interface SimulationAreaProps {
  data: LineCount[];
}

export const SimulationArea = forwardRef<SimulationAreaHandle, SimulationAreaProps>(
  ({ data }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { pause, resume, setEffectsEnabled } = useAnimatedSimulation(containerRef, data);

    useImperativeHandle(ref, () => ({
      pause,
      resume,
      setEffectsEnabled,
    }));

    return <div id="sim" ref={containerRef} />;
  },
);
