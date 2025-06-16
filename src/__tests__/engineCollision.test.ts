/** @jest-environment jsdom */
import { Engine, Body } from '../client/physics';

describe('Engine collisions', () => {
  it('bodies bounce after collision', () => {
    const engine = new Engine(100, 100);
    engine.gravity.y = 0;
    const a = new Body({ position: { x: 30, y: 50 }, velocity: { x: 1, y: 0 }, radius: 10 });
    const b = new Body({ position: { x: 70, y: 50 }, velocity: { x: -1, y: 0 }, radius: 10 });
    engine.add([a, b]);

    for (let i = 0; i < 30; i += 1) {
      engine.update(16);
    }

    expect(a.velocity.x).toBeLessThan(0);
    expect(b.velocity.x).toBeGreaterThan(0);
  });

  it('uses restitution for collisions', () => {
    const engine = new Engine(100, 100);
    engine.gravity.y = 0;
    const a = new Body({ position: { x: 30, y: 50 }, velocity: { x: 1, y: 0 }, radius: 10, restitution: 0.5 });
    const b = new Body({ position: { x: 70, y: 50 }, velocity: { x: -1, y: 0 }, radius: 10, restitution: 0.5 });
    engine.add([a, b]);

    for (let i = 0; i < 30; i += 1) {
      engine.update(16);
    }

    expect(a.velocity.x).toBeLessThan(0);
    expect(b.velocity.x).toBeGreaterThan(0);
    expect(Math.abs(a.velocity.x)).toBeLessThan(1);
    expect(Math.abs(b.velocity.x)).toBeLessThan(1);
  });
});
