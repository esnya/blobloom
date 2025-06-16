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

  it('ignores outdated responses', async () => {
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1, added: 0, removed: 0 }];
    const linesSecond = [{ file: 'a', lines: 2, added: 1, removed: 0 }];
    let resolveFirst: (() => void) | undefined;
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url.startsWith('/outdated/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    global.WebSocket = jest.fn(() => {
      const socket = {
        readyState: 1,
        send: jest.fn((data: string) => {
          const { id, token } = JSON.parse(data) as { id: string; token: number };
          if (id === 'c2') {
            resolveFirst = () => {
              messageHandler?.(
                new MessageEvent('message', {
                  data: JSON.stringify({ counts: linesFirst, token }),
                }),
              );
            };
          } else {
            messageHandler?.(
              new MessageEvent('message', {
                data: JSON.stringify({ counts: linesSecond, token }),
              }),
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

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const base = '/outdated';
    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: base }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));

    act(() => {
      rerender({ ts: 2000 });
    });

    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);

    act(() => {
      resolveFirst?.();
    });

    await waitFor(() => expect(result.current.lineCounts).toEqual(linesSecond));

  });
});
