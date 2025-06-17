/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useAnimatedNumber } from '../../client/hooks/useAnimatedNumber';

describe('useAnimatedNumber extra tests', () => {
  const originalRaf = global.requestAnimationFrame;
  const originalCancel = global.cancelAnimationFrame;
  let now = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    global.requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => {
        now += 50;
        cb(now);
      }, 0) as unknown as number;
    global.cancelAnimationFrame = jest.fn(id => clearTimeout(id as unknown as number));
  });

  afterEach(() => {
    jest.clearAllTimers();
    (performance.now as jest.Mock).mockRestore();
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCancel;
    jest.useRealTimers();
  });

  it('rounds values when enabled', () => {
    const { result } = renderHook(() =>
      useAnimatedNumber(0, { duration: 100, round: true }),
    );

    act(() => {
      result.current[1](5);
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(Number.isInteger(result.current[0])).toBe(true);

    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(result.current[0]).toBe(5);
  });

  it('cancels animation on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useAnimatedNumber(0, { duration: 100 }),
    );

    act(() => {
      result.current[1](5);
    });

    unmount();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
});
