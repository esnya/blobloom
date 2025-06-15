import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react';
import Matter from 'matter-js';
import {
  FileCircleContent,
  type FileCircleContentHandle,
} from './FileCircleContent';
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
}

export const FileCircle = forwardRef<FileCircleHandle, FileCircleProps>(
  (
    { file, lines, initialRadius, engine, width, height },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<FileCircleContentHandle>(null);
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

    const updateRadius = (r: number): void => {
      if (r === radius) return;
      Body.scale(body, r / radius, r / radius);
      setRadius(r);
      const el = containerRef.current;
      if (el) {
        el.style.width = `${r * 2}px`;
        el.style.height = `${r * 2}px`;
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        body,
        radius,
        updateRadius,
        charsEl: contentRef.current?.charsEl ?? null,
        setCount: contentRef.current?.setCount ?? (() => {}),
        showGlow: contentRef.current?.showGlow ?? (() => {}),
      }),
      [body, radius],
    );

    const dir = file.split('/');
    const name = dir.pop() ?? '';

    return (
      <div
        className="file-circle"
        ref={containerRef}
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
          container={containerRef}
          ref={contentRef}
        />
      </div>
    );
  },
);
