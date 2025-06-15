/** @jest-environment jsdom */
import React from 'react';
import { renderHook } from '@testing-library/react';
import { PhysicsProvider, useEngine } from '../client/hooks';

describe('PhysicsProvider', () => {
  it('updates engine bounds', () => {
    let width = 50;
    let height = 60;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PhysicsProvider bounds={{ width, height }}>{children}</PhysicsProvider>
    );

    const { result, rerender } = renderHook(() => useEngine(), { wrapper });

    expect(result.current.bounds).toEqual({ width: 50, height: 60 });

    width = 80;
    height = 90;
    rerender();

    expect(result.current.bounds).toEqual({ width: 80, height: 90 });
  });
});
