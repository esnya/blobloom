/** @jest-environment jsdom */
import { Engine, Body } from '../client/physics';

describe('Engine wall friction', () => {
  it('adds spin when hitting walls', () => {
    const engine = new Engine(100, 100);
    engine.gravity.y = 0;
    const body = new Body({
      position: { x: 10, y: 50 },
      velocity: { x: -1, y: 1 },
      radius: 10,
      friction: 0.5,
    });
    engine.add(body);

    for (let i = 0; i < 30; i += 1) {
      engine.update(16);
    }

    expect(Math.abs(body.angularVelocity)).toBeGreaterThan(0);
  });
});
