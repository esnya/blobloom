import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface FileCircleContentHandle {
  charsEl: HTMLDivElement | null;
  setCount: (n: number) => void;
  showGlow: (cls: string, ms?: number) => void;
}

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  container: React.RefObject<HTMLDivElement>;
}

export const FileCircleContent = forwardRef<
  FileCircleContentHandle,
  FileCircleContentProps
>(({ path, name, count, container }, ref) => {
  const [currentCount, setCurrentCount] = useState(count);
  const charsRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      charsEl: charsRef.current,
      setCount: setCurrentCount,
      showGlow: (cls: string, ms = 500) => {
        const el = container.current;
        if (!el) return;
        el.classList.add(cls);
        setTimeout(() => el.classList.remove(cls), ms);
      },
    }),
    [container],
  );

  return (
    <>
      <div className="path">{path}</div>
      <div className="name">{name}</div>
      <div className="count">{currentCount}</div>
      <div className="chars" ref={charsRef} />
    </>
  );
});

