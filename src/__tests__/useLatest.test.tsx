/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { useLatest } from '../client/hooks/useLatest';

describe('useLatest', () => {
  it('stores the latest value in a ref', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 0 },
    });

    expect(result.current.current).toBe(0);
    rerender({ value: 1 });
    expect(result.current.current).toBe(1);
    rerender({ value: 2 });
    expect(result.current.current).toBe(2);
  });
});
