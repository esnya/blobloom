import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Engine } from '../physics/engine';

interface Bounds {
  width: number;
  height: number;
}

const EngineContext = createContext<Engine | null>(null);

interface PhysicsProviderProps {
  bounds: Bounds;
  engine?: Engine;
  children: React.ReactNode;
}

export function PhysicsProvider({ bounds, engine: externalEngine, children }: PhysicsProviderProps): React.JSX.Element {
  const engine = useMemo(
    () => externalEngine ?? Engine.create(bounds.width, bounds.height),
    [externalEngine, bounds.width, bounds.height],
  );

  useEffect(() => {
    engine.bounds.width = bounds.width;
    engine.bounds.height = bounds.height;
    engine.bounds.top = -bounds.height;
  }, [engine, bounds.width, bounds.height]);

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export const useEngine = (): Engine => {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine must be used within PhysicsProvider');
  return engine;
};
