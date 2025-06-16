/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { App } from '../client/App';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App autoplay', () => {
  const originalFetch = global.fetch;
  const originalRaf = global.requestAnimationFrame;
  let now = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.startsWith('/api/commits')) {
        if (input.endsWith('/lines')) {
          return Promise.resolve({ json: () => Promise.resolve({ counts: [{ file: 'a', lines: 1 }] }) });
        }
        return Promise.resolve({ json: () => Promise.resolve({ commits }) });
      }
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    }) as jest.Mock;
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
    global.fetch = originalFetch;
    global.requestAnimationFrame = originalRaf;
  });

  it('advances timestamp automatically', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    const initial = Number(input.value);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => expect(Number(input.value)).toBeGreaterThan(initial));
  });
});

