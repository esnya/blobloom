/** @jest-environment jsdom */
import React, { Suspense } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimelineData } from '../../client/hooks/useTimelineData';

describe('useTimelineData', () => {
  const originalFetch = global.fetch;
  const originalWebSocket = global.WebSocket;

  afterEach(() => {
    global.fetch = originalFetch;
    global.WebSocket = originalWebSocket;
  });

  it('sends updates only when commit id changes', async () => {
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1, added: 0, removed: 0 }];
    const linesSecond = [{ file: 'a', lines: 2, added: 1, removed: 0 }];
    global.fetch = jest.fn(() => Promise.reject(new Error('unexpected fetch')));

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    const send = jest.fn((data: string) => {
      const { id, token } = JSON.parse(data) as { id: string; token: number };
      if (id === 'HEAD') {
        messageHandler?.(
          new MessageEvent('message', {
            data: JSON.stringify({ counts: linesSecond, commits, token }),
          }),
        );
      } else {
        const counts = id === 'c2' ? linesFirst : linesSecond;
        messageHandler?.(
          new MessageEvent('message', {
            data: JSON.stringify({ counts, token }),
          }),
        );
      }
    });

    global.WebSocket = jest.fn(() => {
      const socket = {
        readyState: 1,
        send,
        close: jest.fn(),
        addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
          if (ev === 'message') messageHandler = cb;
          if (ev === 'open') cb(new Event('open') as MessageEvent);
        },
      } as unknown as WebSocket;
      return socket;
    }) as unknown as typeof WebSocket;
    (global.WebSocket as unknown as { OPEN: number }).OPEN = 1;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/dedup' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(send).toHaveBeenCalledTimes(2));

    act(() => {
      rerender({ ts: 1500 });
    });
    await waitFor(() => expect(send).toHaveBeenCalledTimes(2));

    act(() => {
      rerender({ ts: 2000 });
    });
    await waitFor(() => expect(send).toHaveBeenCalledTimes(3));
  });
});
