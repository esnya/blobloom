/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { FilePathDisplay } from '../client/components/FilePathDisplay';

describe('FilePathDisplay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('types new text on change', () => {
    const { container, rerender } = render(<FilePathDisplay path="a/" name="b" />);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(container.textContent).toBe('a/b');

    act(() => {
      rerender(<FilePathDisplay path="c/" name="d" />);
    });
    expect(container.textContent).toBe('');

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(container.textContent).toBe('c/d');
  });
});
