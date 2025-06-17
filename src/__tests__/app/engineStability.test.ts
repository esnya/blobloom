/** @jest-environment jsdom */
import { Engine } from '../../client/physics/engine';
import { Body } from '../../client/physics/body';

describe('Engine stability', () => {
  it('settles multiple bodies in a small space', () => {
    const engine = new Engine(40, 40);
    const bodies: Body[] = [];
    engine.gravity.y = 0;
    for (let i = 0; i < 5; i += 1) {
      const body = new Body({
        position: { x: 20, y: 5 + i * 6 },
        velocity: { x: 0, y: 2 },
        radius: 5,
        restitution: 0,
        friction: 0.5,
        frictionAir: 0.05,
        angularDamping: 0.01,
      });
      body.angularVelocity = 1;
      bodies.push(body);
    }
    engine.add(bodies);
    for (let i = 0; i < 5; i += 1) engine.update(16);
    for (const b of bodies) {
      expect(Math.abs(b.velocity.x)).toBeLessThan(0.01);
      expect(Math.abs(b.velocity.y)).toBeLessThan(0.01);
      expect(Math.abs(b.angularVelocity)).toBeLessThan(0.01);
    }
  });
});
