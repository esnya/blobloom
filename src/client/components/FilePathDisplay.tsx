import React from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export interface FilePathDisplayProps {
  path: string;
  name: string;
  hidden?: boolean | undefined;
}

export function FilePathDisplay({
  path,
  name,
  hidden,
}: FilePathDisplayProps): React.JSX.Element {
  const typedPath = useTypewriter(path);
  const typedName = useTypewriter(name);
  const baseStyle = hidden ? { display: 'none' } : undefined;

  const pathStyle = {
    ...baseStyle,
    fontSize: 'calc(var(--radius) * 0.15)',
  } as React.CSSProperties;

  const nameStyle = {
    ...baseStyle,
    fontSize: 'calc(var(--radius) * 0.175)',
  } as React.CSSProperties;

  return (
    <>
      <div className="path" style={pathStyle}>{typedPath}</div>
      <div className="name" style={nameStyle}>{typedName}</div>
    </>
  );
}
