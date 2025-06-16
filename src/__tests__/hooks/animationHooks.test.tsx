/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useAnimatedNumber } from '../../client/hooks/useAnimatedNumber';

type TestCase = {
  name: string;
  useHook: (initial: number, duration: number) => readonly [number, (n: number) => void];
  initial: number;
  target: number;
  round: boolean;
};

const cases: readonly TestCase[] = [
  {
    name: 'useAnimatedNumber',
    useHook: (initial, duration) => useAnimatedNumber(initial, { duration }),
    initial: 0,
    target: 10,
    round: false,
  },
] as const;

jest.useFakeTimers();

describe.each(cases)('$name', ({ useHook, initial, target, round }) => {
  const originalRaf = global.requestAnimationFrame;
  let now = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    global.requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => {
        now += 50;
        cb(now);
      }, 0) as unknown as number;
  });

  afterEach(() => {
    jest.clearAllTimers();
    (performance.now as jest.Mock).mockRestore();
    global.requestAnimationFrame = originalRaf;
    jest.useRealTimers();
  });

  it('eases to the target within duration', () => {
    const { result } = renderHook(() => useHook(initial, 100));

    act(() => {
      result.current[1](target);
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBeGreaterThan(initial + (target - initial) / 2);
    if (round) expect(Number.isInteger(result.current[0])).toBe(true);

    act(() => {
      jest.advanceTimersByTime(60);
    });
    if (round) {
      expect(result.current[0]).toBe(target);
      expect(Number.isInteger(result.current[0])).toBe(true);
    } else {
      expect(result.current[0]).toBeCloseTo(target);
    }
  });

  it('returns a stable animate function', () => {
    const { result } = renderHook(() => useHook(initial, 100));
    const animate = result.current[1];

    act(() => {
      result.current[1](target);
      jest.advanceTimersByTime(150);
    });

    expect(result.current[1]).toBe(animate);
  });
});
