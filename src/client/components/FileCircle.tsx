import React, { useEffect, useId, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { FileCircleContent, type FileCircleContentHandle } from './FileCircleContent';
import { colorForFile } from '../lines';

const { Bodies, Body, Composite } = Matter;

export interface FileCircleHandle extends FileCircleContentHandle {
  body: Matter.Body;
  radius: number;
  updateRadius: (r: number) => void;
}

interface FileCircleProps {
  file: string;
  lines: number;
  initialRadius: number;
  engine: Matter.Engine;
  width: number;
  height: number;
  onReady?: (handle: FileCircleHandle) => void;
}

export function FileCircle({
  file,
  lines,
  initialRadius,
  engine,
  width,
  height,
  onReady,
}: FileCircleProps): React.JSX.Element {
  const containerId = useId();
  const [contentHandle, setContentHandle] = useState<FileCircleContentHandle | null>(null);
  const [radius, setRadius] = useState(initialRadius);
  const [body] = useState(() =>
    Bodies.circle(
      Math.random() * (width - 2 * initialRadius) + initialRadius,
      -Math.random() * height - initialRadius,
      initialRadius,
      { restitution: 0.9, frictionAir: 0.01 },
    ),
  );

  useEffect(() => {
    Composite.add(engine.world, body);
    return () => {
      Composite.remove(engine.world, body);
    };
  }, [engine, body]);

  const updateRadius = useCallback((r: number): void => {
    if (r === radius) return;
    Body.scale(body, r / radius, r / radius);
    setRadius(r);
    const el = document.getElementById(containerId);
    if (el) {
      el.style.width = `${r * 2}px`;
      el.style.height = `${r * 2}px`;
    }
  }, [radius, body, containerId]);

  useEffect(() => {
    if (!contentHandle) return;
    onReady?.({
      body,
      radius,
      updateRadius,
      ...contentHandle,
    });
  }, [contentHandle, onReady, body, radius, updateRadius]);

  const dir = file.split('/');
  const name = dir.pop() ?? '';

  return (
    <div
      className="file-circle"
      id={containerId}
      style={{
        position: 'absolute',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: '50%',
        background: colorForFile(file),
        willChange: 'transform',
      }}
    >
      <FileCircleContent
        path={dir.join('/') + (dir.length ? '/' : '')}
        name={name}
        count={lines}
        containerId={containerId}
        onReady={setContentHandle}
      />
    </div>
  );
}

