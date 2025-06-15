import React, { useEffect, useId, useState } from 'react';

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
  const charsId = useId();
  const [chars, setChars] = useState<
    Array<{
      id: string;
      cls: string;
      char: string;
      offset: { x: number; y: number };
      rotate: string;
      delay: number;
      color?: string;
      onEnd: () => void;
    }>
  >([]);

  useEffect(() => {
    if (!onReady) return;
    const handle: FileCircleContentHandle = {
      setCount: setCurrentCount,
      spawnChar: (cls, offset, onEnd, color) => {
        const effect = {
          id: Math.random().toString(36).slice(2),
          cls,
          char: Math.random().toString(36).charAt(2),
          offset,
          rotate: `${Math.random() * 360}deg`,
          delay: Math.random() * 0.5,
          onEnd,
          ...(color ? { color } : {}),
        };
        setChars((prev) => [...prev, effect]);
      },
    };
    onReady(handle);
  }, [onReady, nextId]);

  return (
    <>
      <div className="path" style={{ display: hidden ? 'none' : undefined }}>{path}</div>
      <div className="name" style={{ display: hidden ? 'none' : undefined }}>{name}</div>
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
              setChars((prev) => prev.filter((e) => e.id !== c.id));
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


