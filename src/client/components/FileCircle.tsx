import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useBody } from '../hooks/useBody';
import { FileCircleContent } from './FileCircleContent';
import { colorForFile } from '../colors';
import { useGlowControl } from '../hooks/useGlowControl';
import { CharEffects } from './CharEffects';
import { useCharEffects } from '../hooks/useCharEffects';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { usePrevious } from '../hooks/usePrevious';
export const MAX_EFFECT_CHARS = 100;

const useInitialGlow = (startGlow: (cls: string) => void) => {
  useEffect(() => {
    startGlow('glow-new');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const useLineChangeEffects = (
  lines: number,
  prevLines: number,
  charsLength: number,
  currentRadius: number,
  startGlow: (cls: string) => void,
  spawnChar: (cls: string, offset: { x: number; y: number }, onEnd: () => void) => void,
) => {
  useEffect(() => {
    if (prevLines === lines) return;
    if (lines > prevLines) startGlow('glow-grow');
    else if (lines < prevLines) startGlow('glow-shrink');
    const diff = lines - prevLines;
    const available = Math.max(0, MAX_EFFECT_CHARS - charsLength);
    const spawn = Math.min(Math.abs(diff), available);
    for (let i = 0; i < spawn; i += 1) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * currentRadius * 2.5;
      const offset = { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
      spawnChar(diff > 0 ? 'add-char' : 'remove-char', offset, () => {});
    }
  }, [lines, prevLines, startGlow, spawnChar, charsLength, currentRadius]);
};

const useAnimateRadius = (
  radius: number,
  currentRadius: number,
  animateRadius: (n: number) => void,
) => {
  useEffect(
    () => {
      if (radius !== currentRadius) animateRadius(radius);
      // currentRadius intentionally omitted from deps to avoid update loops
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [radius, animateRadius],
  );
};

const useSyncBodyRadius = (
  currentRadius: number,
  setBodyRadius: (r: number) => void,
) => {
  useEffect(() => {
    setBodyRadius(currentRadius);
  }, [currentRadius, setBodyRadius]);
};

interface FileCircleProps {
  file: string;
  lines: number;
  radius: number;
}

// eslint-disable-next-line no-restricted-syntax
export const FileCircle = React.forwardRef<HTMLDivElement, FileCircleProps>(
  ({ file, lines, radius }, ref): React.JSX.Element => {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);
  const { body, setRadius: setBodyRadius } = useBody({
    radius,
    restitution: 0.9,
    frictionAir: 0.001,
    onUpdate: forceUpdate,
  });
  const [currentRadius, animateRadius] = useAnimatedNumber(radius);
  const { startGlow, glowProps } = useGlowControl();
  const { chars, spawnChar, removeChar } = useCharEffects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const color = useMemo(() => colorForFile(file), []);
  const prevLines = usePrevious(lines);

  useInitialGlow(startGlow);
  useLineChangeEffects(
    lines,
    prevLines,
    chars.length,
    currentRadius,
    startGlow,
    spawnChar,
  );
  useAnimateRadius(radius, currentRadius, animateRadius);
  useSyncBodyRadius(currentRadius, setBodyRadius);

  const dir = file.split('/');
  const name = dir.pop() ?? '';

  return (
    <>
      <div
        // eslint-disable-next-line no-restricted-syntax
        ref={ref}
        className={`file-circle ${glowProps.className}`.trim()}
        onAnimationEnd={glowProps.onAnimationEnd}
        style={{
          position: 'absolute',
          '--radius': `${currentRadius}px`,
          width: 'calc(var(--radius) * 2)',
          height: 'calc(var(--radius) * 2)',
          borderRadius: '50%',
          background: color,
          willChange: 'transform',
          transform: `translate3d(${body.position.x - currentRadius}px, ${body.position.y - currentRadius}px, 0) rotate(${body.angle}rad)`,
        } as React.CSSProperties}
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
  },
);

FileCircle.displayName = 'FileCircle';

