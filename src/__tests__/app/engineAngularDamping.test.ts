/** @jest-environment jsdom */
import { Engine } from '../../client/physics/engine';
import { Body } from '../../client/physics/body';

describe('Engine angular damping', () => {
  it('reduces angular velocity over time', () => {
    const engine = new Engine(200, 100);
    engine.gravity.y = 0;
    const body = new Body({ position: { x: 50, y: 50 }, radius: 10, angularDamping: 0.001 });
    body.angularVelocity = 1;
    engine.add(body);

    for (let i = 0; i < 60; i += 1) engine.update(16);

    expect(body.angularVelocity).toBeLessThan(1);
  });
});
