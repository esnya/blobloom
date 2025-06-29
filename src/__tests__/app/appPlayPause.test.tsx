/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react';
import { App } from '../../client/App';
import { setupAppTest } from '../helpers/app';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App play/pause', () => {
  const originalRaf = global.requestAnimationFrame;
  let now = 0;
  let restore: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    restore = setupAppTest({ commits });
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
    jest.useRealTimers();
    restore();
  });

  it('pauses and resumes playback when toggled', async () => {
    const { container } = render(<App />);
    await waitFor(() =>
      expect(container.querySelectorAll('#commit-log li').length).toBeGreaterThan(0),
    );

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    const button = container.querySelector('#controls button') as HTMLButtonElement;
    await waitFor(() => expect(button.disabled).toBe(false));
    const initial = Number(input.value);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(Number(input.value)).toBe(initial);

    fireEvent.click(button); // play
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => expect(Number(input.value)).toBeGreaterThan(initial));

    fireEvent.click(button); // pause
    const pausedValue = Number(input.value);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(Number(input.value)).toBe(pausedValue);

    fireEvent.click(button); // resume

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => expect(Number(input.value)).toBeGreaterThan(pausedValue));
  });
});
