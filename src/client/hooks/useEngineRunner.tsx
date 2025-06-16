import React, { useEffect } from 'react';
import { Engine } from '../physics';
import { useEngine } from './useEngine';

export interface EngineRunnerOptions {
  raf?: (cb: FrameRequestCallback) => number;
  now?: () => number;
}

export const useEngineRunner = (
  { raf = requestAnimationFrame, now = performance.now.bind(performance) }: EngineRunnerOptions = {},
): void => {
  const engine = useEngine();
  useEffect(() => {
    let frame = 0;
    let last = now();
    const step = (time: number): void => {
      Engine.update(engine, time - last);
      last = time;
      frame = raf(step);
    };
    frame = raf(step);
    return () => cancelAnimationFrame(frame);
  }, [engine, raf, now]);
};

export interface PhysicsRunnerProps extends EngineRunnerOptions {
  children: React.ReactNode;
}

export const PhysicsRunner = ({ children, ...opts }: PhysicsRunnerProps): React.JSX.Element => {
  useEngineRunner(opts);
  return <>{children}</>;
};
