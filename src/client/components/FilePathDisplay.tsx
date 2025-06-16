import React from 'react';
import { useTypewriter } from '../hooks';

export interface FilePathDisplayProps {
  path: string;
  name: string;
  hidden?: boolean;
}

export function FilePathDisplay({
  path,
  name,
  hidden,
}: FilePathDisplayProps): React.JSX.Element {
  const pathText = useTypewriter(path);
  const nameText = useTypewriter(name);

  return (
    <>
      <div className="path" style={{ display: hidden ? 'none' : undefined }}>{pathText}</div>
      <div className="name" style={{ display: hidden ? 'none' : undefined }}>{nameText}</div>
    </>
  );
}
