import React, { createContext, useContext, useEffect, useMemo } from 'react';
import * as Physics from '../physics';

interface Bounds {
  width: number;
  height: number;
}

const EngineContext = createContext<Physics.Engine | null>(null);

interface PhysicsProviderProps {
  bounds: Bounds;
  engine?: Physics.Engine;
  children: React.ReactNode;
}

export function PhysicsProvider({ bounds, engine: externalEngine, children }: PhysicsProviderProps): React.JSX.Element {
  const engine = useMemo(
    () => externalEngine ?? Physics.Engine.create(bounds.width, bounds.height),
    [externalEngine, bounds.width, bounds.height],
  );

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
    engine.bounds.top = -bounds.height;
  }, [engine, bounds.width, bounds.height]);

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export const useEngine = (): Physics.Engine => {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine must be used within PhysicsProvider');
  return engine;
};
