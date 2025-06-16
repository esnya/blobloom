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

  it('eases to the target within duration', () => {
    const { result } = renderHook(() => useCountAnimation(0, 100));

    act(() => {
      result.current[1](100);
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBeGreaterThan(50);

    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(result.current[0]).toBe(100);
  });
});
