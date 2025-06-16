/** @jest-environment jsdom */
import React, { Suspense } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTimelineData } from '../client/hooks/useTimelineData';

describe('useTimelineData', () => {
  const originalFetch = global.fetch;
  const originalWebSocket = global.WebSocket;

  afterEach(() => {
    global.fetch = originalFetch;
    global.WebSocket = originalWebSocket;
  });

  it('fetches commits and line counts', async () => {
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1, added: 0, removed: 0 }];
    const linesSecond = [{ file: 'a', lines: 2, added: 1, removed: 0 }];
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url.startsWith('/basic/api/commits')) {
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
          const counts = id === 'c2' ? linesFirst : linesSecond;
          messageHandler?.(
            new MessageEvent('message', { data: JSON.stringify({ counts, token }) }),
          );
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

    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(
      calls.filter(
        ([u]) => typeof u === 'string' && u.startsWith(`${base}/api/commits`) && !u.includes('/lines'),
      ).length,
    ).toBe(1);
    expect(calls).toHaveLength(1);
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

  it('maps renamed files to previous names', async () => {
    const commits = [
      { id: 'c1', message: 'rename', timestamp: 2 },
      { id: 'c0', message: 'init', timestamp: 1 },
    ];
    const linesInit = [{ file: 'a.txt', lines: 1, added: 0, removed: 0 }];
    const linesRenamed = [{ file: 'b.txt', lines: 1, added: 0, removed: 0 }];
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url.startsWith('/rename/api/commits')) {
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
          if (id === 'c0') {
            messageHandler?.(
              new MessageEvent('message', { data: JSON.stringify({ counts: linesInit, token }) }),
            );
          } else {
            messageHandler?.(
              new MessageEvent('message', {
                data: JSON.stringify({ counts: linesRenamed, renames: { 'b.txt': 'a.txt' }, token }),
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

