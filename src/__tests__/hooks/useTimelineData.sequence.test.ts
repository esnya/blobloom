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
  });

  it('updates sequentially during playback', async () => {
    const commits = [
      { id: 'c3', message: 'c3', timestamp: 3 },
      { id: 'c2', message: 'c2', timestamp: 2 },
      { id: 'c1', message: 'c1', timestamp: 1 },
    ];
    const lineMap = {
      c1: [{ file: 'a', lines: 1, added: 0, removed: 0 }],
      c2: [{ file: 'a', lines: 2, added: 0, removed: 0 }],
      c3: [{ file: 'a', lines: 3, added: 0, removed: 0 }],
    } as const;
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url.startsWith('/sequence/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    const callbacks: Array<() => void> = [];
    global.WebSocket = jest.fn(() => {
      const socket = {
        readyState: 1,
        send: jest.fn((data: string) => {
          const { id, token } = JSON.parse(data) as {
            id: keyof typeof lineMap;
            token: number;
          };
          callbacks.push(() => {
            messageHandler?.(
              new MessageEvent('message', {
                data: JSON.stringify({ counts: lineMap[id], token }),
              }),
            );
          });
        }),
        close: jest.fn(),
        addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
          if (ev === 'message') messageHandler = cb;
          if (ev === 'open') cb(new Event('open') as MessageEvent);
        },
      } as unknown as WebSocket;
      return socket;
    }) as unknown as typeof WebSocket;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/sequence' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));

    act(() => {
      rerender({ ts: 2000 });
    });
    act(() => {
      rerender({ ts: 3000 });
    });

    act(() => {
      callbacks[0]?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(lineMap.c1));

    act(() => {
      callbacks[1]?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(lineMap.c2));

    act(() => {
      callbacks[2]?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(lineMap.c3));
  });
});
