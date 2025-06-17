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

  it('receives commits and line counts via WebSocket', async () => {
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1, added: 0, removed: 0 }];
    const linesSecond = [{ file: 'a', lines: 2, added: 1, removed: 0 }];
    global.fetch = jest.fn(() => Promise.reject(new Error('unexpected fetch')));

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    global.WebSocket = jest.fn(() => {
      const socket = {
        readyState: 1,
        send: jest.fn((data: string) => {
          const { timestamp, token } = JSON.parse(data) as { timestamp: number; token: number };
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
          } else {
            const counts = timestamp === commits[1]!.timestamp * 1000 ? linesFirst : linesSecond;
            messageHandler?.(
              new MessageEvent('message', {
                data: JSON.stringify({ type: 'data', counts, token, commits: [] }),
              }),
            );
            messageHandler?.(
              new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
            );
          }
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

    const base = '/basic';
    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: base }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));
    expect(result.current.end).toBe(2000);
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual(linesFirst),
    );

    act(() => {
      rerender({ ts: 2000 });
    });
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual(linesSecond),
    );

    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(0);
  });
});
