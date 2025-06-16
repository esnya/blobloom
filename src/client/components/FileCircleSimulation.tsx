// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PhysicsProvider } from '../hooks/useEngine';
import { PhysicsRunner } from '../hooks/useEngineRunner';
import { useEngine } from '../hooks/useEngine';
import { FileCircle } from './FileCircle';
import type { LineCount } from '../types';
import { computeScale } from '../scale';

interface FileCircleSimulationProps {
  data: LineCount[];
}

export function FileCircleSimulation({ data }: FileCircleSimulationProps): React.JSX.Element {
  /* eslint-disable no-restricted-syntax */
  const containerRef = useRef<HTMLDivElement>(null);
  /* eslint-enable no-restricted-syntax */
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBounds = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      setBounds({ width: rect?.width ?? 0, height: rect?.height ?? 0 });
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  return (
    // eslint-disable-next-line no-restricted-syntax
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {bounds.width > 0 && (
        <PhysicsProvider bounds={bounds}>
          <PhysicsRunner>
            <FileCircleList data={data} bounds={bounds} />
          </PhysicsRunner>
        </PhysicsProvider>
      )}
    </div>
  );
}

export interface FileCircleListProps {
  data: LineCount[];
  bounds: { width: number; height: number };
  linear?: boolean;
  effectsEnabled?: boolean;
}

export function FileCircleList({ data, bounds, linear, effectsEnabled = true }: FileCircleListProps): React.JSX.Element {
  const engine = useEngine();

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
  }, [engine, bounds.width, bounds.height]);

  const scale = useMemo(
    () =>
      computeScale(
        bounds.width,
        bounds.height,
        data,
        linear !== undefined ? { linear } : {},
      ),
    [bounds.width, bounds.height, data, linear],
  );

  return (
    <>
      {data.map((d) => {
        const r = (Math.pow(d.lines, 0.5) * scale) / 2;
        if (r * 2 < 1) return null;
        return (
          <FileCircle
            key={d.file}
            file={d.file}
            lines={d.lines}
            radius={r}
            effectsEnabled={effectsEnabled}
          />
        );
      })}
    </>
  );
}
