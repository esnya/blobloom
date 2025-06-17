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
    global.fetch = jest.fn(() => Promise.reject(new Error('unexpected fetch')));

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    const callbacks: Array<() => void> = [];
    global.WebSocket = jest.fn(() => {
      const socket = {
        readyState: 1,
        send: jest.fn((data: string) => {
          const { id, token } = JSON.parse(data) as {
            id: keyof typeof lineMap | 'HEAD';
            token: number;
          };
          callbacks.push(() => {
            if (id === 'HEAD') {
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'range', start: 1000, end: 3000, token }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'data', counts: lineMap.c3, commits, token }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
              );
            } else {
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'data', counts: lineMap[id], token, commits: [] }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
              );
            }
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
    (global.WebSocket as unknown as { OPEN: number }).OPEN = 1;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/sequence' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    act(() => {
      callbacks.shift()?.();
    });
    await waitFor(() => expect(result.current.start).toBe(1000));

    act(() => {
      rerender({ ts: 2000 });
    });
    act(() => {
      rerender({ ts: 3000 });
    });

    act(() => {
      callbacks.shift()?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(lineMap.c1));

    act(() => {
      callbacks.shift()?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(lineMap.c2));

    act(() => {
      callbacks.shift()?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(lineMap.c3));
  });
});
