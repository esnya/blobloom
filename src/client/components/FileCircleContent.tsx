import React, { useLayoutEffect, useState } from 'react';

export interface FileCircleContentHandle {
  charsEl: HTMLDivElement | null;
  setCount: (n: number) => void;
  showGlow: (cls: string, ms?: number) => void;
}

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  container: HTMLElement | null;
  onReady?: (handle: FileCircleContentHandle) => void;
}
export function FileCircleContent({
  path,
  name,
  count,
  container,
  onReady,
}: FileCircleContentProps): React.JSX.Element {
  const [currentCount, setCurrentCount] = useState(count);
  const [charsEl, setCharsEl] = useState<HTMLDivElement | null>(null);

  const showGlow = (cls: string, ms = 500): void => {
    if (!container) return;
    container.classList.add(cls);
    setTimeout(() => container.classList.remove(cls), ms);
  };

  useLayoutEffect(() => {
    onReady?.({ charsEl, setCount: setCurrentCount, showGlow });
  }, [charsEl, onReady]);

  return (
    <>
      <div className="path">{path}</div>
      <div className="name">{name}</div>
      <div className="count">{currentCount}</div>
      <div className="chars" ref={setCharsEl} />
    </>
  );
}

