import { useCallback, useEffect, useState } from 'react';
import { useEngine } from './useEngine';
import type * as Physics from '../physics';

interface BodyOptions {
  radius: number;
  restitution?: number;
  frictionAir?: number;
  friction?: number;
  onUpdate?: (body: Physics.Body) => void;
}

export const useBody = (options: BodyOptions) => {
  const engine = useEngine();
  const { radius, restitution = 0, frictionAir = 0, friction = 0 } = options;

  const [, setTransform] = useState(() => ({
    position: { x: 0, y: 0 },
    angle: 0,
  }));

  const [body] = useState(() => {
    const b = engine.circle(
      Math.random() * (engine.bounds.width - radius * 2) + radius,
      -radius,
      radius,
      { restitution, frictionAir, friction },
    );
    setTransform({ position: { ...b.position }, angle: b.angle });
    return b;
  });

  useEffect(() => {
    body.onUpdate = () => {
      setTransform({ position: { ...body.position }, angle: body.angle });
      options.onUpdate?.(body);
    };
  }, [body, options]);

  useEffect(() => {
    engine.add(body);
    return () => {
      engine.remove(body);
    };
  }, [engine, body]);

  const setRadius = useCallback(
    (r: number) => {
      if (body.radius === undefined || body.radius === r) return;
      body.scale(r / body.radius, r / body.radius);
    },
    [body],
  );

  return { body, setRadius } as const;
};
