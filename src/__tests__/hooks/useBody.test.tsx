/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { PhysicsProvider, useEngine } from '../../client/hooks/useEngine';
import { useBody } from '../../client/hooks/useBody';

describe('useBody', () => {
  it('adds body to engine and supports size updates', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PhysicsProvider bounds={{ width: 100, height: 100 }}>{children}</PhysicsProvider>
    );

    const { result, unmount } = renderHook(() => {
      const engine = useEngine();
      const info = useBody({ radius: 10 });
      return { engine, ...info };
    }, { wrapper });

    expect(result.current.engine.world.bodies).toContain(result.current.body);

    act(() => {
      result.current.setRadius(20);
    });
    expect(result.current.body.radius).toBe(20);

    unmount();
    expect(result.current.engine.world.bodies).not.toContain(result.current.body);
  });

  it('spawns body just above the view with random x', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PhysicsProvider bounds={{ width: 200, height: 100 }}>{children}</PhysicsProvider>
    );

    const { result } = renderHook(() => {
      const engine = useEngine();
      const info = useBody({ radius: 10 });
      return { engine, ...info };
    }, { wrapper });

    expect(result.current.body.position.y).toBe(-10);
    expect(result.current.body.position.x).toBeGreaterThanOrEqual(10);
    expect(result.current.body.position.x).toBeLessThanOrEqual(190);
  });

  it('keeps body.onUpdate stable when options object changes', () => {
    const onUpdate = jest.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PhysicsProvider bounds={{ width: 100, height: 100 }}>{children}</PhysicsProvider>
    );

    const { result, rerender } = renderHook(
      ({ options }: { options: Parameters<typeof useBody>[0] }) => {
        const engine = useEngine();
        const info = useBody(options);
        return { engine, ...info };
      },
      { wrapper, initialProps: { options: { radius: 10, onUpdate } } },
    );

    const initialOnUpdate = result.current.body.onUpdate;
    rerender({ options: { radius: 10, onUpdate } });
    expect(result.current.body.onUpdate).toBe(initialOnUpdate);
  });
});
