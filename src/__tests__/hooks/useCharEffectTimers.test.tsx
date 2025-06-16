/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useCharEffectTimers } from '../../client/hooks/useCharEffectTimers';

jest.useFakeTimers();

describe('useCharEffectTimers', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  it('calls the callback after the timeout', () => {
    const { result } = renderHook(() => useCharEffectTimers());
    const cb = jest.fn();

    act(() => {
      result.current.spawnTimeout('a', 0.1, cb);
    });
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(cb).toHaveBeenCalled();
  });

  it('provides stable refs and clears timers', () => {
    const { result } = renderHook(() => useCharEffectTimers());
    const cb = jest.fn();

    const ref1 = result.current.getNodeRef('b');
    const ref2 = result.current.getNodeRef('b');

    expect(ref1).toBe(ref2);

    act(() => {
      result.current.spawnTimeout('b', 0, cb);
      result.current.clear('b');
      jest.advanceTimersByTime(1500);
    });

    expect(cb).not.toHaveBeenCalled();
  });
});
