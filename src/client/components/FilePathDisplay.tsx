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
  const style = hidden ? { display: 'none' } : undefined;

  return (
    <>
      <div className="path" style={style}>{typedPath}</div>
      <div className="name" style={style}>{typedName}</div>
    </>
  );
}
