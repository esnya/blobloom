/** @jest-environment jsdom */
import React from 'react';
import { renderHook } from '@testing-library/react';
import { PhysicsProvider, useEngine } from '../../client/hooks/useEngine';

describe('PhysicsProvider', () => {
  it('updates engine bounds', () => {
    let width = 50;
    let height = 60;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PhysicsProvider bounds={{ width, height }}>{children}</PhysicsProvider>
    );

    const { result, rerender } = renderHook(() => useEngine(), { wrapper });

    expect(result.current.bounds).toEqual({ width, height, top: -height });

    width = 80;
    height = 90;
    rerender();

    expect(result.current.bounds).toEqual({ width, height, top: -height });
  });
});
