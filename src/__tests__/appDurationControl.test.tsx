/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../client/App';
import { createPlayer } from '../client/player';

jest.mock('../client/player');

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App duration control', () => {
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
    (createPlayer as jest.Mock).mockReturnValue({
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      togglePlay: jest.fn(),
      isPlaying: jest.fn(() => false),
    });
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.startsWith('/api/commits')) {
        if (input.endsWith('/lines')) {
          return Promise.resolve({
            json: () => Promise.resolve({ counts: [{ file: 'a', lines: 1 }] }),
          });
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
    jest.clearAllMocks();
  });

  it('recreates player with new duration', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());

    const input = container.querySelector('#duration') as HTMLInputElement;
    expect(input.value).toBe('30');

    fireEvent.change(input, { target: { value: '10' } });

    await waitFor(() => {
      const mock = createPlayer as jest.MockedFunction<typeof createPlayer>;
      const last = mock.mock.calls[mock.mock.calls.length - 1] as unknown as [
        Record<string, unknown>,
      ];
      expect(last[0]).toEqual(expect.objectContaining({ duration: 10 }));
    });
  });
});
