import React from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export interface FilePathDisplayProps {
  path: string;
  name: string;
  radius: number;
  hidden?: boolean | undefined;
}

export function FilePathDisplay({
  path,
  name,
  radius,
  hidden,
}: FilePathDisplayProps): React.JSX.Element {
  const typedPath = useTypewriter(path);
  const typedName = useTypewriter(name);
  const baseStyle = hidden ? { display: 'none' } : undefined;

  const pathStyle = {
    ...baseStyle,
    fontSize: `${radius * 0.3}px`,
  } as React.CSSProperties;

  const nameStyle = {
    ...baseStyle,
    fontSize: `${radius * 0.35}px`,
  } as React.CSSProperties;

  return (
    <>
      <div className="path" style={pathStyle}>{typedPath}</div>
      <div className="name" style={nameStyle}>{typedName}</div>
    </>
  );
}
