/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useGlowAnimation } from '../client/hooks/useGlowAnimation';

describe('useGlowAnimation', () => {
  it('starts and clears class', () => {
    const { result } = renderHook(() => useGlowAnimation());

    act(() => {
      result.current[0]('glow');
    });
    expect(result.current[1].className).toBe('glow');

    act(() => {
      result.current[1].onAnimationEnd();
    });
    expect(result.current[1].className).toBe('');
  });
});
