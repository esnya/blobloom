/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { PhysicsProvider } from '../../client/hooks/useEngine';
import { FileCircle } from '../../client/components/FileCircle';

jest.useFakeTimers();

describe('FileCircle text size', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <PhysicsProvider bounds={{ width: 100, height: 100 }}>{children}</PhysicsProvider>
  );

  it('scales text based on radius', () => {
    const { container } = render(<FileCircle file="a" lines={1} radius={20} />, { wrapper: Wrapper });
    const path = container.querySelector('.path') as HTMLElement;
    const name = container.querySelector('.name') as HTMLElement;
    const count = container.querySelector('.count') as HTMLElement;
    expect(path.style.fontSize).toBe('calc(var(--radius) * 0.15)');
    expect(name.style.fontSize).toBe('calc(var(--radius) * 0.175)');
    expect(count.style.fontSize).toBe('calc(var(--radius) * 0.3)');
  });
});
