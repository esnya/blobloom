/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import type { Engine } from '../../client/physics';
import { PhysicsProvider, useEngine } from '../../client/hooks/useEngine';
import { FileCircle } from '../../client/components/FileCircle';

jest.useFakeTimers();

describe('FileCircle rotation CSS variable', () => {
  let engine: Engine | undefined;
  const CaptureEngine = () => {
    engine = useEngine();
    return null;
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <PhysicsProvider bounds={{ width: 100, height: 100 }}>
      <CaptureEngine />
      {children}
    </PhysicsProvider>
  );

  it('updates --rotate when body angle changes', () => {
    const { container } = render(
      <FileCircle file="a" lines={1} radius={10} />, { wrapper: Wrapper },
    );
    const circle = container.querySelector('.file-circle') as HTMLElement;
    expect(circle.style.getPropertyValue('--rotate')).toBe('0rad');

    act(() => {
      const body = engine!.world.bodies[0]!;
      body.angle = Math.PI / 2;
      body.onUpdate?.(body);
    });

    expect(circle.style.getPropertyValue('--rotate')).toBe(`${Math.PI / 2}rad`);
  });

  it('uses CSS variable for rotation transform', () => {
    const { container } = render(
      <FileCircle file="a" lines={1} radius={10} />,
      { wrapper: Wrapper },
    );
    const circle = container.querySelector('.file-circle') as HTMLElement;

    expect(circle.style.transform).toMatch(/rotate\(var\(--rotate\)\)/);
  });
});
