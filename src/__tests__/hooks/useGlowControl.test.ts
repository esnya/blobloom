/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useGlowControl } from '../../client/hooks/useGlowControl';

describe('useGlowControl', () => {
  it('starts and clears class', () => {
    const { result } = renderHook(() => useGlowControl());

    act(() => {
      result.current.startGlow('glow');
    });
    expect(result.current.glowProps.className).toBe('glow');

    act(() => {
      result.current.glowProps.onAnimationEnd();
    });
    expect(result.current.glowProps.className).toBe('');
  });
});
