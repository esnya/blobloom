/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useFileCircleRefs } from '../client/hooks/useFileCircleRefs';

describe('useFileCircleRefs', () => {
  it('returns stable refs and deletes them', () => {
    const { result } = renderHook(() => useFileCircleRefs());

    const ref1 = result.current.getRef('a');
    const ref2 = result.current.getRef('a');

    expect(ref1).toBe(ref2);

    act(() => {
      result.current.deleteRef('a');
    });

    const ref3 = result.current.getRef('a');
    expect(ref3).not.toBe(ref1);
  });
});
