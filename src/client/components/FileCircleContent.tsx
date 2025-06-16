import React, { useEffect } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { FilePathDisplay } from './FilePathDisplay';

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  hidden?: boolean;
}

export function FileCircleContent({
  path,
  name,
  count,
  hidden,
}: FileCircleContentProps): React.JSX.Element {
  const [currentCount, animateCount] = useAnimatedNumber(count, { round: true });

  useEffect(() => {
    animateCount(count);
  }, [count, animateCount]);

  return (
    <>
      <FilePathDisplay path={path} name={name} hidden={hidden} />
      <div className="count" style={{ display: hidden ? 'none' : undefined }}>{currentCount}</div>
    </>
  );
}


