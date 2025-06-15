/* eslint-disable no-restricted-syntax */
import React, { useEffect, useId, useState, useCallback, useRef } from 'react';
import { useBody } from '../hooks';
import * as Physics from '../physics';
import { FileCircleContent, type FileCircleContentHandle } from './FileCircleContent';
import { colorForFile } from '../lines';
import { useGlowControl } from '../hooks';

export interface FileCircleHandle extends FileCircleContentHandle {
  body: Physics.Body;
  radius: number;
  updateRadius: (r: number) => void;
  showGlow: (cls: string) => void;
  hide: () => void;
  el: HTMLElement;
}

interface FileCircleProps {
  file: string;
  lines: number;
  initialRadius: number;
  onReady?: (handle: FileCircleHandle) => void;
}

export function FileCircle({
  file,
  lines,
  initialRadius,
  onReady,
}: FileCircleProps): React.JSX.Element {
  const { body, setRadius: setBodyRadius } = useBody({
    radius: initialRadius,
    restitution: 0.9,
    frictionAir: 0.01,
  });
  const containerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHandle, setContentHandle] = useState<FileCircleContentHandle | null>(null);
  const [radius, setRadius] = useState(initialRadius);
  const { startGlow, glowProps } = useGlowControl();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    Physics.Body.setPosition(body, {
      x: body.position.x,
      y: -Math.random() * (window.innerHeight || 0) - initialRadius,
    });
  }, [body, initialRadius]);

  const updateRadius = useCallback((r: number): void => {
    if (r === radius) return;
    Physics.Body.scale(body, r / radius, r / radius);
    setBodyRadius(r);
    setRadius(r);
    const el = document.getElementById(containerId);
    if (el) {
      el.style.width = `${r * 2}px`;
      el.style.height = `${r * 2}px`;
    }
  }, [radius, body, containerId, setBodyRadius]);

  const showGlow = useCallback(
    (cls: string): void => {
      startGlow(cls);
    },
    [startGlow],
  );

  const hide = useCallback((): void => {
    setHidden(true);
  }, []);

  useEffect(() => {
    if (!contentHandle) return;
    onReady?.({
      body,
      radius,
      updateRadius,
      ...contentHandle,
      showGlow,
      hide,
      el: containerRef.current!,
    });
  }, [contentHandle, onReady, body, radius, updateRadius, showGlow, hide]);

  const dir = file.split('/');
  const name = dir.pop() ?? '';

  return (
    <div
      className={`file-circle ${glowProps.className}`}
      id={containerId}
      ref={containerRef}
      onAnimationEnd={glowProps.onAnimationEnd}
      style={{
        position: 'absolute',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: '50%',
        background: hidden ? 'transparent' : colorForFile(file),
        willChange: 'transform',
        transform: `translate3d(${body.position.x - radius}px, ${body.position.y - radius}px, 0) rotate(${body.angle}rad)`,
      }}
    >
      <FileCircleContent
        path={dir.join('/') + (dir.length ? '/' : '')}
        name={name}
        count={lines}
        hidden={hidden}
        onReady={setContentHandle}
      />
    </div>
  );
}

