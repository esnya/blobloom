/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from '../../client/hooks/useTypewriter';

jest.useFakeTimers();

describe('useTypewriter', () => {
  it('animates when value changes', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, 50),
      { initialProps: { text: 'foo' } },
    );

    expect(result.current).toBe('foo');

    rerender({ text: 'bar' });
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('b');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('bar');
  });
});
