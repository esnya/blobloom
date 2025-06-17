/** @jest-environment jsdom */
import { Engine, Body } from '../../client/physics';

describe('Engine angular exchange', () => {
  it('exchanges angular velocity on collision', () => {
    const engine = new Engine(200, 100);
    engine.gravity.y = 0;
    const a = new Body({
      position: { x: 70, y: 50 },
      velocity: { x: 1, y: 0 },
      radius: 10,
      friction: 0.5,
    });
    const b = new Body({
      position: { x: 130, y: 50 },
      velocity: { x: -1, y: 0 },
      radius: 10,
      friction: 0.5,
    });
    a.angularVelocity = 1;
    b.angularVelocity = 1;
    engine.add([a, b]);

    for (let i = 0; i < 30; i += 1) {
      engine.update(16);
    }

    expect(a.angularVelocity).not.toBeCloseTo(1);
    expect(b.angularVelocity).not.toBeCloseTo(1);
  });
});
