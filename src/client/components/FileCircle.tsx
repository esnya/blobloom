import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useBody } from '../hooks/useBody';
import { FileCircleContent } from './FileCircleContent';
import { colorForFile } from '../colors';
import { useGlowControl } from '../hooks/useGlowControl';
import { CharEffects } from './CharEffects';
import { useCharEffects } from '../hooks/useCharEffects';
import { useRadiusAnimation } from '../hooks/useRadiusAnimation';
import { usePrevious } from '../hooks/usePrevious';
export const MAX_EFFECT_CHARS = 100;

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
  const [currentRadius, animateRadius] = useRadiusAnimation(radius);
  const { startGlow, glowProps } = useGlowControl();
  const { chars, spawnChar, removeChar } = useCharEffects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const color = useMemo(() => colorForFile(file), []);
  const prevLines = usePrevious(lines);

  useEffect(() => {
    startGlow('glow-new');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevLines === lines) return;
    if (lines > prevLines) startGlow('glow-grow');
    else if (lines < prevLines) startGlow('glow-shrink');
    const diff = lines - prevLines;
    const active = chars.length;
    const available = Math.max(0, MAX_EFFECT_CHARS - active);
    const spawn = Math.min(Math.abs(diff), available);
    for (let i = 0; i < spawn; i += 1) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * currentRadius * 2.5;
      const offset = { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
      spawnChar(diff > 0 ? 'add-char' : 'remove-char', offset, () => {});
    }
  }, [lines, prevLines, startGlow, spawnChar, chars.length, currentRadius]);

  useEffect(() => {
    if (radius !== currentRadius) animateRadius(radius);
  }, [radius, currentRadius, animateRadius]);

  useEffect(() => {
    setBodyRadius(currentRadius);
  }, [currentRadius, setBodyRadius]);

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
          background: color,
          willChange: 'transform',
          transform: `translate3d(${body.position.x - currentRadius}px, ${body.position.y - currentRadius}px, 0) rotate(${body.angle}rad)`,
        }}
      >
        <FileCircleContent
          path={dir.join('/') + (dir.length ? '/' : '')}
          name={name}
          count={lines}
        />
        <CharEffects effects={{ chars, spawnChar, removeChar }} />
      </div>
    </>
  );
}

