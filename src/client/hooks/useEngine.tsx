import React, { createContext, useContext, useEffect, useMemo } from 'react';
import * as Physics from '../physics';

interface Bounds {
  width: number;
  height: number;
}

const EngineContext = createContext<Physics.Engine | null>(null);

interface PhysicsProviderProps {
  bounds: Bounds;
  children: React.ReactNode;
}

export function PhysicsProvider({ bounds, children }: PhysicsProviderProps): React.JSX.Element {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const engine = useMemo(() => Physics.Engine.create(bounds.width, bounds.height), []);

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
  }, [engine, bounds.width, bounds.height]);

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export const useEngine = (): Physics.Engine => {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine must be used within PhysicsProvider');
  return engine;
};
