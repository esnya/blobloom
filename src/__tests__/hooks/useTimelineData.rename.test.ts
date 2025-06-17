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

  it('maps renamed files to previous names', async () => {
    const commits = [
      { id: 'c1', message: 'rename', timestamp: 2 },
      { id: 'c0', message: 'init', timestamp: 1 },
    ];
    const linesInit = [{ file: 'a.txt', lines: 1, added: 0, removed: 0 }];
    const linesRenamed = [{ file: 'b.txt', lines: 1, added: 0, removed: 0 }];
    global.fetch = jest.fn(() => Promise.reject(new Error('unexpected fetch')));

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    global.WebSocket = jest.fn(() => {
      const socket = {
        readyState: 1,
        send: jest.fn((data: string) => {
          const { id, token } = JSON.parse(data) as { id: string; token: number };
          if (id === 'HEAD') {
            messageHandler?.(
              new MessageEvent('message', {
                data: JSON.stringify({ type: 'range', start: 1000, end: 2000, token }),
              }),
            );
            messageHandler?.(
              new MessageEvent('message', { data: JSON.stringify({ type: 'data', counts: linesInit, commits, token }) }),
            );
            messageHandler?.(
              new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
            );
          } else if (id === 'c0') {
            messageHandler?.(
              new MessageEvent('message', { data: JSON.stringify({ type: 'data', counts: linesInit, token, commits: [] }) }),
            );
            messageHandler?.(
              new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }),
            );
          } else {
            messageHandler?.(
              new MessageEvent('message', {
                data: JSON.stringify({ type: 'data', counts: linesRenamed, renames: { 'b.txt': 'a.txt' }, token, commits: [] }),
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

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/rename' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.lineCounts).toEqual(linesInit));

    act(() => {
      rerender({ ts: 2000 });
    });
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual([
        { file: 'a.txt', lines: 1, added: 0, removed: 0 },
      ]),
    );
  });
});
