import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useFileSimulation } from '../hooks';
import { fetchLineCounts } from '../api';
import type { JsonFetcher } from '../api';

export interface SimulationAreaHandle {
  pause: () => void;
  resume: () => void;
  setEffectsEnabled: (state: boolean) => void;
}

interface SimulationAreaProps {
  timestamp: number;
  end: number;
  json: JsonFetcher;
}

export const SimulationArea = forwardRef<SimulationAreaHandle, SimulationAreaProps>(
  ({ timestamp, end, json }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { update, pause, resume, setEffectsEnabled } = useFileSimulation(containerRef);

    useEffect(() => {
      (async () => {
        const counts = await fetchLineCounts(json, timestamp);
        update(counts);
        if (timestamp >= end) {
          console.log('[debug] physics area updated for final commit at', timestamp);
        }
      })();
    }, [timestamp, json, end, update]);

    useImperativeHandle(ref, () => ({
      pause,
      resume,
      setEffectsEnabled,
    }));

    return <div id="sim" ref={containerRef} />;
  },
);
