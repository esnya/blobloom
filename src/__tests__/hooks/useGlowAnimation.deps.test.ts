/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { useGlowAnimation } from '../../client/hooks/useGlowAnimation';

describe('useGlowAnimation dependencies', () => {
  it('keeps callbacks stable when deps do not change', () => {
    const { result, rerender } = renderHook(({d}) => useGlowAnimation([d]), {
      initialProps: { d: 1 },
    });
    const start = result.current[0];
    const end = result.current[1].onAnimationEnd;
    rerender({ d: 1 });
    expect(result.current[0]).toBe(start);
    expect(result.current[1].onAnimationEnd).toBe(end);
  });

  it('updates callbacks when deps change', () => {
    const { result, rerender } = renderHook(({d}) => useGlowAnimation([d]), {
      initialProps: { d: 1 },
    });
    const start = result.current[0];
    rerender({ d: 2 });
    expect(result.current[0]).not.toBe(start);
  });
});
