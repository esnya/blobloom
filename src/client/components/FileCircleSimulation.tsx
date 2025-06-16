import React, { useEffect, useMemo } from 'react';
import { PhysicsProvider } from '../hooks/useEngine';
import { PhysicsRunner } from '../hooks/useEngineRunner';
import { useEngine } from '../hooks/useEngine';
import { CharEffectsProvider } from '../hooks/useGlobalCharEffects';
import { FileCircle } from './FileCircle';
import type { LineCount } from '../types';
import { computeScale } from '../scale';
import { useContainerBounds } from '../hooks/useContainerBounds';

interface FileCircleSimulationProps {
  data: LineCount[];
}

export function FileCircleSimulation({ data }: FileCircleSimulationProps): React.JSX.Element {
  const { ref: containerRef, bounds } = useContainerBounds();

  return (
    // eslint-disable-next-line no-restricted-syntax
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {bounds.width > 0 && (
        <PhysicsProvider bounds={bounds}>
          <CharEffectsProvider>
            <PhysicsRunner>
              <FileCircleList data={data} bounds={bounds} />
            </PhysicsRunner>
          </CharEffectsProvider>
        </PhysicsProvider>
      )}
    </div>
  );
}

export interface FileCircleListProps {
  data: LineCount[];
  bounds: { width: number; height: number };
  linear?: boolean;
}

export function FileCircleList({ data, bounds, linear }: FileCircleListProps): React.JSX.Element {
  const engine = useEngine();

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
    engine.bounds.top = -bounds.height;
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
          />
        );
      })}
    </>
  );
}
