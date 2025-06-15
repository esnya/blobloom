import { useCallback, useEffect, useState } from 'react';
import * as Physics from '../physics';
import { useEngine } from './useEngine';

interface BodyOptions {
  radius: number;
  restitution?: number;
  frictionAir?: number;
}

export const useBody = (options: BodyOptions) => {
  const engine = useEngine();
  const { radius, restitution = 0, frictionAir = 0 } = options;

  const [body] = useState(() =>
    Physics.Bodies.circle(
      Math.random() * (engine.bounds.width - radius * 2) + radius,
      -radius,
      radius,
      { restitution, frictionAir },
    ),
  );

  useEffect(() => {
    Physics.Composite.add(engine.world, body);
    return () => {
      Physics.Composite.remove(engine.world, body);
    };
  }, [engine, body]);

  const setRadius = useCallback(
    (r: number) => {
      if (body.radius === undefined || body.radius === r) return;
      Physics.Body.scale(body, r / body.radius, r / body.radius);
    },
    [body],
  );

  return { body, setRadius } as const;
};
