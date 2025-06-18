/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react';
import { App } from '../../client/App';
import { setupAppTest } from '../helpers/app';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App seek bar enabled during play', () => {
  const originalRaf = global.requestAnimationFrame;
  let restore: () => void;
  let now = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    restore = setupAppTest({ commits, doneDelay: 100 });
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

  it('does not disable the seek bar while awaiting data', async () => {
    const { container } = render(<App />);
    await waitFor(() =>
      expect(container.querySelectorAll('#commit-log li').length).toBeGreaterThan(0),
    );
    const range = container.querySelector('input[type="range"]') as HTMLInputElement;
    const button = container.querySelector('#controls button') as HTMLButtonElement;
    await waitFor(() => expect(range.disabled).toBe(false));

    fireEvent.click(button); // play
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(range.disabled).toBe(false);
  });
});
