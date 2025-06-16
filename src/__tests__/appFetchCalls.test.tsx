/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../client/App';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App API calls', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    global.WebSocket = jest.fn(() => ({
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
        if (ev === 'open') cb(new MessageEvent('open'));
        if (ev === 'message') cb(new MessageEvent('message', { data: JSON.stringify({ counts: [{ file: 'a', lines: 1 }] }) }));
      },
    })) as unknown as typeof WebSocket;
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
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete (global as unknown as { WebSocket?: unknown }).WebSocket;
  });

  it('fetches commits once and lines on timestamp change', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());
    const fetchMock = global.fetch as jest.Mock;
    expect(
      fetchMock.mock.calls.filter(
        ([u]) => typeof u === 'string' && u.startsWith('/api/commits') && !u.includes('/lines'),
      ),
    ).toHaveLength(1);
    expect(fetchMock.mock.calls.some(([u]) => typeof u === 'string' && u.includes('/lines'))).toBe(false);

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1500' } });

    await waitFor(() => expect(fetchMock.mock.calls.length).toBe(1));
    expect(
      fetchMock.mock.calls.filter(
        ([u]) => typeof u === 'string' && u.startsWith('/api/commits') && !u.includes('/lines'),
      ),
    ).toHaveLength(1);
  });
});
