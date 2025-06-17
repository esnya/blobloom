/** @jest-environment jsdom */
import { Engine, Body } from '../../client/physics';

describe('Engine wall friction decay', () => {
  it('does not accumulate angular velocity', () => {
    const engine = new Engine(200, 100);
    engine.gravity.y = 0;
    const body = new Body({
      position: { x: 20, y: 50 },
      velocity: { x: -2, y: 2 },
      radius: 10,
      friction: 0.5,
    });
    engine.add(body);

    for (let i = 0; i < 120; i += 1) engine.update(16);

    expect(Math.abs(body.angularVelocity)).toBeLessThan(0.05);
  });
});
