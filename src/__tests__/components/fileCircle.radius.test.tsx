/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { PhysicsProvider } from '../../client/hooks/useEngine';
import { FileCircle } from '../../client/components/FileCircle';

jest.useFakeTimers();

describe('FileCircle radius effect', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <PhysicsProvider bounds={{ width: 100, height: 100 }}>{children}</PhysicsProvider>
  );

  it('does not exceed update depth when radius changes', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <FileCircle file="a" lines={1} radius={10} />, { wrapper: Wrapper }
    );
    act(() => {
      rerender(<FileCircle file="a" lines={1} radius={20} />);
    });
    expect(errorSpy).not.toHaveBeenCalledWith(expect.stringContaining('Maximum update depth'));
    errorSpy.mockRestore();
  });
});
