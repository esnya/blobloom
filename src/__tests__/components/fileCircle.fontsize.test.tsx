/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { PhysicsProvider } from '../../client/hooks/useEngine';
import { FileCircle } from '../../client/components/FileCircle';

describe('FileCircle text scaling', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <PhysicsProvider bounds={{ width: 100, height: 100 }}>{children}</PhysicsProvider>
  );

  it('sets radius CSS variable', () => {
    const { container } = render(
      <FileCircle file="a" lines={1} radius={15} />, { wrapper: Wrapper }
    );
    const circle = container.firstElementChild as HTMLElement;
    expect(circle.style.getPropertyValue('--r')).toBe('15px');
  });
});
