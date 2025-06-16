/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { usePrevious } from '../client/hooks/usePrevious';

describe('usePrevious', () => {
  it('returns the previous value', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    });

    expect(result.current).toBe(0);
    rerender({ value: 1 });
    expect(result.current).toBe(0);
    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });
});
