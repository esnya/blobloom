/** @jest-environment jsdom */
import React, { Suspense } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTimelineData } from '../../client/hooks/useTimelineData';

describe('useTimelineData', () => {
  const originalFetch = global.fetch;
  const originalWebSocket = global.WebSocket;

  afterEach(() => {
    global.fetch = originalFetch;
    global.WebSocket = originalWebSocket;
    jest.useRealTimers();
  });

  it('reconnects and resends the current commit', async () => {
    jest.useFakeTimers();
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url.startsWith('/reconnect/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    const sockets: Array<{
      send: jest.Mock<void, [string]>;
      triggerClose: () => void;
      triggerOpen: () => void;
    }> = [];
    global.WebSocket = jest.fn(() => {
      let closeHandler: (() => void) | undefined;
      let openHandler: (() => void) | undefined;
      const send = jest.fn() as jest.Mock<void, [string]>;
      const socket = {
        readyState: 1,
        send,
        close: jest.fn(),
        addEventListener: (ev: string, cb: (e: Event) => void) => {
          if (ev === 'open') openHandler = () => cb(new Event('open'));
          if (ev === 'close') closeHandler = () => cb(new CloseEvent('close'));
        },
      } as unknown as WebSocket;
      sockets.push({
        send,
        triggerClose: () => closeHandler?.(),
        triggerOpen: () => openHandler?.(),
      });
      setTimeout(() => openHandler?.(), 0);
      return socket;
    }) as unknown as typeof WebSocket;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    renderHook(
      () => useTimelineData({ timestamp: 0, baseUrl: '/reconnect' }),
      { wrapper },
    );
    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => expect(sockets.length).toBe(1));
    const first = sockets[0];
    if (!first) throw new Error('first socket');
    const firstSend = JSON.parse(first.send.mock.calls[0]![0]) as { id: string };
    expect(firstSend.id).toBe('c2');

    act(() => {
      first.triggerClose();
      jest.advanceTimersByTime(1000);
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => expect(sockets.length).toBe(2));
    const second = sockets[1];
    if (!second) throw new Error('second socket');
    const secondSend = JSON.parse(second.send.mock.calls[0]![0]) as {
      id: string;
    };
    expect(secondSend.id).toBe('c2');
  });
});
