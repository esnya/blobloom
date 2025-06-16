// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useRef, useState } from 'react';
import { PhysicsProvider } from '../hooks/useEngine';
import { PhysicsRunner, useEngineRunner } from '../hooks/useEngineRunner';
import { useEngine } from '../hooks/useEngine';
import { useFileCircleHandles } from '../hooks/useFileCircleHandles';
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

interface FileCircleListProps {
  data: LineCount[];
  bounds: { width: number; height: number };
}

function FileCircleList({ data, bounds }: FileCircleListProps): React.JSX.Element {
  const engine = useEngine();
  const { register, forEach, get } = useFileCircleHandles();

  useEngineRunner();

  useEffect(() => {
    const handleOutOfBounds = (): void => {
      forEach((h) => {
        const { x, y } = h.body.position;
        const r = h.radius;
        if (
          x < -r ||
          x > bounds.width + r ||
          y > bounds.height + r ||
          y < -bounds.height - r
        ) {
          h.body.setVelocity({ x: 0, y: 0 });
          h.body.setPosition({
            x: Math.random() * (engine.bounds.width - 2 * r) + r,
            y: -r,
          });
        }
      });
    };
    const id = requestAnimationFrame(function loop() {
      handleOutOfBounds();
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [engine, bounds.width, bounds.height, forEach]);

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
  }, [engine, bounds.width, bounds.height]);

  const scale = computeScale(bounds.width, bounds.height, data);

  useEffect(() => {
    data.forEach((d) => {
      const handle = get(d.file);
      if (handle) {
        const r = (Math.pow(d.lines, 0.5) * scale) / 2;
        handle.updateRadius(r);
        handle.setCount(d.lines);
      }
    });
  }, [data, scale, get]);

  return (
    <>
      {data.map((d) => {
        const r = (Math.pow(d.lines, 0.5) * scale) / 2;
        return (
          <FileCircle
            key={d.file}
            file={d.file}
            lines={d.lines}
            initialRadius={r}
            onReady={(h) => {
              register(d.file, h);
            }}
          />
        );
      })}
    </>
  );
}
