/** @jest-environment jsdom */
import { Engine, Body } from '../../client/physics';

describe('Engine frictionAir', () => {
  it('scales with delta time', () => {
    const opts = {
      position: { x: 500, y: 500 },
      velocity: { x: -1, y: 1 },
      radius: 0,
      friction: 0.5,
      frictionAir: 0.01,
    };
    const e1 = new Engine(1000, 1000);
    const e2 = new Engine(1000, 1000);
    e1.gravity.y = 0;
    e2.gravity.y = 0;
    const b1 = new Body(opts);
    const b2 = new Body(opts);
    e1.add(b1);
    e2.add(b2);
    for (let i = 0; i < 10; i += 1) {
      e1.update(5);
    }
    e2.update(50);
    expect(b1.velocity.x).toBeCloseTo(b2.velocity.x, 5);
    expect(b1.velocity.y).toBeCloseTo(b2.velocity.y, 5);
    expect(b1.angularVelocity).toBeCloseTo(b2.angularVelocity, 5);
  });
});
