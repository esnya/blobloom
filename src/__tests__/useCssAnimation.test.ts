/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useCssAnimation } from '../client/hooks/useCssAnimation';

describe('useCssAnimation', () => {
  it('starts and clears animation class', () => {
    const { result } = renderHook(() => useCssAnimation('fade'));

    act(() => {
      result.current[0]();
    });
    expect(result.current[1].className).toBe('fade');

    act(() => {
      result.current[1].onAnimationEnd();
    });

    expect(result.current[1].className).toBe('');
  });

  it('supports hook factory', () => {
    const useFade = (deps?: React.DependencyList) => useCssAnimation('fade', deps);
    const { result } = renderHook(() => useFade());

    act(() => result.current[0]());
    expect(result.current[1].className).toBe('fade');
  });

  it('updates callbacks when deps change', () => {
    let dep = 0;
    const { result, rerender } = renderHook(() => useCssAnimation('fade', [dep]));
    const start1 = result.current[0];
    dep += 1;
    rerender();
    expect(result.current[0]).not.toBe(start1);
  });
});
