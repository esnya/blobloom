// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBody } from '../hooks/useBody';
import { FileCircleContent } from './FileCircleContent';
import { colorForFile } from '../colors';
import { useGlowControl } from '../hooks/useGlowControl';

interface FileCircleProps {
  file: string;
  lines: number;
  radius: number;
  effectsEnabled?: boolean;
}

export function FileCircle({
  file,
  lines,
  radius,
  effectsEnabled = true,
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
  const { startGlow, glowProps } = useGlowControl();
  /* eslint-disable no-restricted-syntax */
  const prevLines = useRef(lines);
  /* eslint-enable no-restricted-syntax */

  useEffect(() => {
    if (effectsEnabled) startGlow('glow-new');
    prevLines.current = lines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!effectsEnabled) {
      prevLines.current = lines;
      return;
    }
    if (prevLines.current === lines) return;
    if (lines > prevLines.current) startGlow('glow-grow');
    else if (lines < prevLines.current) startGlow('glow-shrink');
    prevLines.current = lines;
  }, [lines, effectsEnabled, startGlow]);
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
        className={`file-circle ${glowProps.className}`.trim()}
        onAnimationEnd={glowProps.onAnimationEnd}
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

