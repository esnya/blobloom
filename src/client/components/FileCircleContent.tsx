import React, { useEffect, useId, useState } from 'react';

export interface FileCircleContentHandle {
  charsEl: HTMLDivElement | null;
  setCount: (n: number) => void;
  showGlow: (cls: string, ms?: number) => void;
}

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  containerId: string;
  onReady?: (handle: FileCircleContentHandle) => void;
}

export function FileCircleContent({
  path,
  name,
  count,
  containerId,
  onReady,
}: FileCircleContentProps): React.JSX.Element {
  const [currentCount, setCurrentCount] = useState(count);
  const charsId = useId();

  useEffect(() => {
    const charsEl = document.getElementById(charsId) as HTMLDivElement | null;
    const container = document.getElementById(containerId) as HTMLDivElement | null;
    if (!onReady) return;
    const handle: FileCircleContentHandle = {
      charsEl,
      setCount: setCurrentCount,
      showGlow: (cls: string, ms = 500) => {
        if (!container) return;
        container.classList.add(cls);
        setTimeout(() => container.classList.remove(cls), ms);
      },
    };
    onReady(handle);
  }, [charsId, containerId, onReady]);

  return (
    <>
      <div className="path">{path}</div>
      <div className="name">{name}</div>
      <div className="count">{currentCount}</div>
      <div className="chars" id={charsId} />
    </>
  );
}


