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

  it('replaces queued updates with the latest timestamp', async () => {
    const commits = [
      { id: 'c2', message: 'c2', timestamp: 2 },
      { id: 'c1', message: 'c1', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1, added: 0, removed: 0 }];
    const linesSecond = [{ file: 'a', lines: 2, added: 1, removed: 0 }];
    global.fetch = jest.fn(() => Promise.reject(new Error('unexpected fetch')));

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    const callbacks: Array<() => void> = [];
    const send = jest.fn((data: string) => {
      const { timestamp, token } = JSON.parse(data) as {
        timestamp: number;
        token: number;
      };
          callbacks.push(() => {
            if (timestamp === Number.MAX_SAFE_INTEGER) {
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'range', start: 1000, end: 2000, token }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'data', counts: linesSecond, commits, token }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
              );
            } else if (timestamp === commits[1]!.timestamp * 1000) {
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'data', counts: linesFirst, token, commits: [] }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
              );
            } else {
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ type: 'data', counts: linesSecond, token, commits: [] }),
                }),
              );
              messageHandler?.(
                new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
              );
            }
          });
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

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/drop' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    act(() => {
      rerender({ ts: 1500 });
      rerender({ ts: 2000 });
      callbacks.shift()?.();
    });
    await waitFor(() => expect(result.current.start).toBe(1000));

    act(() => {
      callbacks.shift()?.();
    });
    await waitFor(() => expect(send).toHaveBeenCalledTimes(2));

    act(() => {
      callbacks.shift()?.();
    });
    await waitFor(() => expect(result.current.lineCounts).toEqual(linesSecond));
  });
});
