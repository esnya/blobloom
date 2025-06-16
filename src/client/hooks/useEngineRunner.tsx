import React, { useEffect } from 'react';
import { useEngine } from './useEngine';

export const useEngineRunner = (): void => {
  const engine = useEngine();
  useEffect(() => {
    engine.start();
    return () => engine.stop();
  }, [engine]);
};

export interface PhysicsRunnerProps {
  children: React.ReactNode;
}

export const PhysicsRunner = ({ children }: PhysicsRunnerProps): React.JSX.Element => {
  useEngineRunner();
  return <>{children}</>;
};
