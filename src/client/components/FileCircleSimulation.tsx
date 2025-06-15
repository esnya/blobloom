/* eslint-disable no-restricted-syntax */
import React, { useEffect, useRef, useState } from 'react';
import { PhysicsProvider, useEngine } from '../hooks';
import { FileCircle, type FileCircleHandle } from './FileCircle';
import type { LineCount } from '../types';
import { computeScale } from '../lines';
import { Body, Engine } from '../physics';

interface FileCircleSimulationProps {
  data: LineCount[];
}

export function FileCircleSimulation({ data }: FileCircleSimulationProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {bounds.width > 0 && (
        <PhysicsProvider bounds={bounds}>
          <FileCircleList data={data} bounds={bounds} />
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
  const handles = useRef<Record<string, FileCircleHandle>>({});

  useEffect(() => {
    let frameId = 0;
    let last = performance.now();
    const step = (time: number): void => {
      Engine.update(engine, time - last);
      last = time;
      Object.values(handles.current).forEach((h) => {
        const { x, y } = h.body.position;
        const r = h.radius;
        h.el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0) rotate(${h.body.angle}rad)`;
        if (
          x < -r ||
          x > bounds.width + r ||
          y > bounds.height + r ||
          y < -bounds.height - r
        ) {
          Body.setVelocity(h.body, { x: 0, y: 0 });
          Body.setPosition(h.body, {
            x: Math.random() * (engine.bounds.width - 2 * r) + r,
            y: -r,
          });
        }
      });
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [engine, bounds.width, bounds.height]);

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
  }, [engine, bounds.width, bounds.height]);

  const scale = computeScale(bounds.width, bounds.height, data);

  useEffect(() => {
    data.forEach((d) => {
      const handle = handles.current[d.file];
      if (handle) {
        const r = (Math.pow(d.lines, 0.5) * scale) / 2;
        handle.updateRadius(r);
        handle.setCount(d.lines);
      }
    });
  }, [data, scale]);

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
            engine={engine}
            width={bounds.width}
            height={bounds.height}
            onReady={(h) => {
              handles.current[d.file] = h;
            }}
          />
        );
      })}
    </>
  );
}
