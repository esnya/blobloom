/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from '../client/hooks/useTypewriter';

describe('useTypewriter', () => {
  it('reveals text over time', () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(({ text }) => useTypewriter(text), {
      initialProps: { text: 'abc' },
    });

    expect(result.current).toBe('');

    act(() => {
      jest.advanceTimersByTime(40);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(80);
    });
    expect(result.current).toBe('abc');

    act(() => rerender({ text: 'de' }));
    expect(result.current).toBe('');

    act(() => {
      jest.advanceTimersByTime(80);
    });
    expect(result.current).toBe('de');
  });
});
