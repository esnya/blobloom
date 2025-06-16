/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import {
  useGlowAnimation,
  type UseGlowAnimationResult,
} from '../../client/hooks/useGlowAnimation';
import { useGlowControl } from '../../client/hooks/useGlowControl';

type ControlResult = ReturnType<typeof useGlowControl>;

type GlowHookResult = UseGlowAnimationResult | ControlResult;

const getHandlers = (current: GlowHookResult) =>
  Array.isArray(current)
    ? { startGlow: current[0], glowProps: current[1] }
    : { startGlow: current.startGlow, glowProps: current.glowProps };

describe.each([
  { name: 'useGlowAnimation', hook: useGlowAnimation },
  { name: 'useGlowControl', hook: useGlowControl },
])('$name', ({ hook }) => {
  it('starts and clears class', () => {
    const { result } = renderHook(() => hook());

    act(() => {
      const { startGlow } = getHandlers(result.current as GlowHookResult);
      startGlow('glow');
    });
    expect(
      getHandlers(result.current as GlowHookResult).glowProps.className,
    ).toBe('glow');

    act(() => {
      getHandlers(result.current as GlowHookResult).glowProps.onAnimationEnd();
    });
    expect(
      getHandlers(result.current as GlowHookResult).glowProps.className,
    ).toBe('');
  });
});
