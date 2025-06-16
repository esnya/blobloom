/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useAnimatedNumber } from '../client/hooks/useAnimatedNumber';

jest.useFakeTimers();

describe('useAnimatedNumber', () => {
  const originalRaf = global.requestAnimationFrame;
  let now = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      return setTimeout(() => {
        now += 50;
        cb(now);
      }, 0) as unknown as number;
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    (performance.now as jest.Mock).mockRestore();
    global.requestAnimationFrame = originalRaf;
  });

  it('animates toward the target', () => {
    const { result } = renderHook(() => useAnimatedNumber(0, { duration: 100 }));

    act(() => {
      result.current[1](10);
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBeGreaterThan(5);

    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(result.current[0]).toBeCloseTo(10);
  });

  it('returns a stable animate function', () => {
    const { result } = renderHook(() => useAnimatedNumber(0));
    const animate = result.current[1];

    act(() => {
      result.current[1](5);
      jest.advanceTimersByTime(150);
    });

    expect(result.current[1]).toBe(animate);
  });
});
