import React, { useEffect, useId } from 'react';
import { useCharEffects } from '../hooks/useCharEffects';
import { useCountAnimation } from '../hooks/useCountAnimation';
import { FilePathDisplay } from './FilePathDisplay';

export interface FileCircleContentHandle {
  setCount: (n: number) => void;
  spawnChar: (
    cls: string,
    offset: { x: number; y: number },
    onEnd: () => void,
    color?: string,
  ) => void;
}

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  hidden?: boolean;
  onReady?: (handle: FileCircleContentHandle) => void;
}

export function FileCircleContent({
  path,
  name,
  count,
  hidden,
  onReady,
}: FileCircleContentProps): React.JSX.Element {
  const [currentCount, animateCount] = useCountAnimation(count);
  const charsId = useId();
  const { chars, spawnChar, removeChar } = useCharEffects();

  useEffect(() => {
    if (!onReady) return;
    const handle: FileCircleContentHandle = {
      setCount: animateCount,
      spawnChar,
    };
    onReady(handle);
  }, [onReady, spawnChar, animateCount]);

  return (
    <>
      <FilePathDisplay path={path} name={name} hidden={hidden} />
      <div className="count" style={{ display: hidden ? 'none' : undefined }}>{currentCount}</div>
      <div className="chars" id={charsId}>
        {chars.map((c) => (
          <span
            key={c.id}
            className={c.cls}
            style={{
              '--x': `${c.offset.x}px`,
              '--y': `${c.offset.y}px`,
              '--rotate': c.rotate,
              animationDelay: `${c.delay}s`,
              color: c.color,
            } as React.CSSProperties}
            onAnimationEnd={() => {
              removeChar(c.id);
              c.onEnd();
            }}
          >
            {c.char}
          </span>
        ))}
      </div>
    </>
  );
}


