import React, { useEffect } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { FilePathDisplay } from './FilePathDisplay';

export interface FileCircleContentProps {
  path: string;
  name: string;
  count: number;
  radius: number;
  hidden?: boolean;
}

export function FileCircleContent({
  path,
  name,
  count,
  radius,
  hidden,
}: FileCircleContentProps): React.JSX.Element {
  const [currentCount, animateCount] = useAnimatedNumber(count, { round: true });

  useEffect(() => {
    animateCount(count);
  }, [count, animateCount]);

  return (
    <>
      <FilePathDisplay
        path={path}
        name={name}
        radius={radius}
        hidden={hidden}
      />
      <div
        className="count"
        style={{
          display: hidden ? 'none' : undefined,
          fontSize: `${radius * 0.3}px`,
        }}
      >
        {currentCount}
      </div>
    </>
  );
}


