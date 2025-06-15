import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createFileSimulation } from '../lines.js';
import { fetchLineCounts } from '../api.js';
import type { JsonFetcher } from '../api.js';

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
    const simRef = useRef<ReturnType<typeof createFileSimulation> | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;
      const sim = createFileSimulation(containerRef.current);
      simRef.current = sim;
      window.addEventListener('resize', sim.resize);
      return () => {
        window.removeEventListener('resize', sim.resize);
        sim.destroy();
      };
    }, []);

    useEffect(() => {
      if (!simRef.current) return;
      (async () => {
        const counts = await fetchLineCounts(json, timestamp);
        simRef.current?.update(counts);
        if (timestamp >= end) {
          console.log('[debug] physics area updated for final commit at', timestamp);
        }
      })();
    }, [timestamp, json, end]);

    useImperativeHandle(ref, () => ({
      pause: () => simRef.current?.pause(),
      resume: () => simRef.current?.resume(),
      setEffectsEnabled: (state: boolean) => simRef.current?.setEffectsEnabled(state),
    }));

    return <div id="sim" ref={containerRef} />;
  },
);
