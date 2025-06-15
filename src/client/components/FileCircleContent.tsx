import React from 'react';

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  countRef: React.Ref<HTMLDivElement>;
  charsRef: React.Ref<HTMLDivElement>;
}

export const FileCircleContent = ({
  path,
  name,
  count,
  countRef,
  charsRef,
}: FileCircleContentProps): React.JSX.Element => (
  <>
    <div className="path">{path}</div>
    <div className="name">{name}</div>
    <div className="count" ref={countRef}>
      {count}
    </div>
    <div className="chars" ref={charsRef} />
  </>
);
