/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { PhysicsProvider, useEngine, useBody } from '../client/hooks';

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
});
