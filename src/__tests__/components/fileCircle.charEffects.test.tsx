/** @jest-environment jsdom */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { PhysicsProvider } from '../../client/hooks/useEngine';
import { FileCircle } from '../../client/components/FileCircle';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhysicsProvider bounds={{ width: 100, height: 100 }}>{children}</PhysicsProvider>
);

describe('FileCircle character effects', () => {
  it('renders add-char elements when lines increase', async () => {
    const { container, rerender } = render(
      <FileCircle file="a" lines={1} radius={10} />, { wrapper: Wrapper },
    );
    act(() => {
      rerender(<FileCircle file="a" lines={2} radius={10} />);
    });
    await waitFor(() => {
      expect(container.querySelectorAll('.add-char').length).toBeGreaterThan(0);
    });
  });

  it('renders remove-char elements when lines decrease', async () => {
    const { container, rerender } = render(
      <FileCircle file="a" lines={2} radius={10} />, { wrapper: Wrapper },
    );
    act(() => {
      rerender(<FileCircle file="a" lines={1} radius={10} />);
    });
    await waitFor(() => {
      expect(container.querySelectorAll('.remove-char').length).toBeGreaterThan(0);
    });
  });
});
