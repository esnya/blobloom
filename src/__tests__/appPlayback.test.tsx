/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react';
import { App } from '../client/App';

const tickCbs: FrameRequestCallback[] = [];
const raf = (cb: FrameRequestCallback) => {
  if (cb.name === 'tick') {
    tickCbs.push(cb);
  }
  return 1;
};

const commits = [
  { commit: { message: 'b', committer: { timestamp: 5 } } },
  { commit: { message: 'a', committer: { timestamp: 0 } } },
];

describe('App playback', () => {
  const originalFetch = global.fetch;
  const originalRaf = global.requestAnimationFrame;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.startsWith('/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve(commits) });
      }
      if (typeof input === 'string' && input.startsWith('/api/lines')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
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
    global.requestAnimationFrame = raf as unknown as typeof requestAnimationFrame;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.requestAnimationFrame = originalRaf;
  });

  it('fails to reach end after 20 seconds due to jitter', async () => {
    const { container, getByText } = render(<App />);

    await waitFor(() => {
      const input = container.querySelector<HTMLInputElement>('input[type="range"]');
      expect(input).not.toBeNull();
      expect(input!.max).not.toBe('0');
    });

    act(() => {
      fireEvent.click(getByText('Play'));
    });

    act(() => tickCbs.shift()?.(0));
    act(() => tickCbs.shift()?.(10000));
    act(() => tickCbs.shift()?.(20000));

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(Number(input.value)).toBeLessThan(5000);
  });
});
