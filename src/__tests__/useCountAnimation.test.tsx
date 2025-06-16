/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useCountAnimation } from '../client/hooks/useCountAnimation';

jest.useFakeTimers();

describe('useCountAnimation', () => {
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

  it('eases to the target within duration and rounds', () => {
    const { result } = renderHook(() => useCountAnimation(0, 100));

    act(() => {
      result.current[1](100);
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBeGreaterThan(50);
    expect(Number.isInteger(result.current[0])).toBe(true);

    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(result.current[0]).toBe(100);
    expect(Number.isInteger(result.current[0])).toBe(true);
  });

  it('returns a stable animate function', () => {
    const { result } = renderHook(() => useCountAnimation(0, 100));
    const animate = result.current[1];

    act(() => {
      result.current[1](10);
      jest.advanceTimersByTime(120);
    });

    expect(result.current[1]).toBe(animate);
  });
});
