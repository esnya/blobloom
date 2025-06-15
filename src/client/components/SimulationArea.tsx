import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { createFileSimulation } from '../lines';
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
      if (data.length) simRef.current?.update(data);
    }, [data]);

    const pause = (): void => simRef.current?.pause();
    const resume = (): void => simRef.current?.resume();
    const setEffectsEnabled = (state: boolean): void =>
      simRef.current?.setEffectsEnabled(state);

    useImperativeHandle(ref, () => ({ pause, resume, setEffectsEnabled }));

    return <div id="sim" ref={containerRef} />;
  },
);
