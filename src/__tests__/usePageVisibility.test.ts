/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { usePageVisibility } from '../client/hooks/usePageVisibility';

describe('usePageVisibility', () => {
  const originalHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');

  afterEach(() => {
    if (originalHidden) {
      Object.defineProperty(document, 'hidden', originalHidden);
    }
  });

  it('responds to visibility changes', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(true);
  });
});
