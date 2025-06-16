import React, { useEffect, useState, useCallback } from 'react';
import { useBody } from '../hooks/useBody';
import { FileCircleContent } from './FileCircleContent';
import { colorForFile } from '../colors';

interface FileCircleProps {
  file: string;
  lines: number;
  radius: number;
}

export function FileCircle({
  file,
  lines,
  radius,
}: FileCircleProps): React.JSX.Element {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);
  const { body, setRadius: setBodyRadius } = useBody({
    radius,
    restitution: 0.9,
    frictionAir: 0.001,
    onUpdate: forceUpdate,
  });
  const [currentRadius, setCurrentRadius] = useState(radius);
  useEffect(() => {
    if (radius === currentRadius) return;
    body.scale(radius / currentRadius, radius / currentRadius);
    setBodyRadius(radius);
    setCurrentRadius(radius);
  }, [radius, currentRadius, body, setBodyRadius]);


  const dir = file.split('/');
  const name = dir.pop() ?? '';

  return (
    <>
      <div
        className="file-circle"
        style={{
          position: 'absolute',
          width: `${currentRadius * 2}px`,
          height: `${currentRadius * 2}px`,
          borderRadius: '50%',
          background: colorForFile(file),
          willChange: 'transform',
          transform: `translate3d(${body.position.x - currentRadius}px, ${body.position.y - currentRadius}px, 0) rotate(${body.angle}rad)`,
        }}
      >
        <FileCircleContent
          path={dir.join('/') + (dir.length ? '/' : '')}
          name={name}
          count={lines}
        />
      </div>
    </>
  );
}

