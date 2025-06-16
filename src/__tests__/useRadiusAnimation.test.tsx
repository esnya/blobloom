/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useRadiusAnimation } from '../client/hooks/useRadiusAnimation';

jest.useFakeTimers();

describe('useRadiusAnimation', () => {
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

  it('eases to the target within duration', () => {
    const { result } = renderHook(() => useRadiusAnimation(10, 100));

    act(() => {
      result.current[1](20);
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBeGreaterThan(15);

    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(result.current[0]).toBeCloseTo(20);
  });

  it('returns a stable animate function', () => {
    const { result } = renderHook(() => useRadiusAnimation(10, 100));
    const animate = result.current[1];

    act(() => {
      result.current[1](20);
      jest.advanceTimersByTime(120);
    });

    expect(result.current[1]).toBe(animate);
  });
});
