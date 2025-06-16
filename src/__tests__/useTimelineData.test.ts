/** @jest-environment jsdom */
import React, { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineData } from '../client/hooks/useTimelineData';

describe('useTimelineData', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
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

    let openCb: (() => void) | undefined;
    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    global.WebSocket = jest.fn(() => ({
      send: jest.fn((data: string) => {
        const { id } = JSON.parse(data) as { id: string };
        const counts = id === 'c2' ? linesFirst : linesSecond;
        messageHandler?.(new MessageEvent('message', { data: JSON.stringify({ counts }) }));
      }),
      close: jest.fn(),
      addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
        if (ev === 'open') {
          openCb = () => cb(new MessageEvent('open'));
          if (messageHandler) openCb();
        } else if (ev === 'message') {
          messageHandler = cb;
          openCb?.();
        }
      },
    })) as unknown as typeof WebSocket;

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

    rerender({ ts: 2000 });
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

    let openCb: (() => void) | undefined;
    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    global.WebSocket = jest.fn(() => ({
      send: jest.fn((data: string) => {
        const { id } = JSON.parse(data) as { id: string };
        if (id === 'c2') {
          resolveFirst?.();
          messageHandler?.(new MessageEvent('message', { data: JSON.stringify({ counts: linesFirst }) }));
        } else {
          messageHandler?.(new MessageEvent('message', { data: JSON.stringify({ counts: linesSecond }) }));
        }
      }),
      close: jest.fn(),
      addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
        if (ev === 'open') {
          openCb = () => cb(new MessageEvent('open'));
          if (messageHandler) openCb();
        } else if (ev === 'message') {
          messageHandler = cb;
          openCb?.();
        }
      },
    })) as unknown as typeof WebSocket;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const base = '/outdated';
    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: base }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));

    rerender({ ts: 2000 });

    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);

    resolveFirst?.();

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

    let openCb: (() => void) | undefined;
    let messageHandler: ((ev: MessageEvent) => void) | undefined;
    global.WebSocket = jest.fn(() => ({
      send: jest.fn((data: string) => {
        const { id } = JSON.parse(data) as { id: string };
        if (id === 'c0') {
          messageHandler?.(new MessageEvent('message', { data: JSON.stringify({ counts: linesInit }) }));
        } else {
          messageHandler?.(
            new MessageEvent('message', { data: JSON.stringify({ counts: linesRenamed, renames: { 'b.txt': 'a.txt' } }) }),
          );
        }
      }),
      close: jest.fn(),
      addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
        if (ev === 'open') {
          openCb = () => cb(new MessageEvent('open'));
          if (messageHandler) openCb();
        } else if (ev === 'message') {
          messageHandler = cb;
          openCb?.();
        }
      },
    })) as unknown as typeof WebSocket;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/rename' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.lineCounts).toEqual(linesInit));

    rerender({ ts: 2000 });
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual([
        { file: 'a.txt', lines: 1, added: 0, removed: 0 },
      ]),
    );
  });
});

