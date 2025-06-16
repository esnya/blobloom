import React, { useEffect, useId, useState } from 'react';
import { useCharEffects, useTypewriter } from '../hooks';

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
  const [currentCount, setCurrentCount] = useState(count);
  const typedPath = useTypewriter(path);
  const typedName = useTypewriter(name);
  const charsId = useId();
  const { chars, spawnChar, removeChar } = useCharEffects();

  useEffect(() => {
    if (!onReady) return;
    const handle: FileCircleContentHandle = {
      setCount: setCurrentCount,
      spawnChar,
    };
    onReady(handle);
  }, [onReady, spawnChar]);

  return (
    <>
      <div className="path typewriter" style={{ display: hidden ? 'none' : undefined }}>{typedPath}</div>
      <div className="name typewriter" style={{ display: hidden ? 'none' : undefined }}>{typedName}</div>
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


