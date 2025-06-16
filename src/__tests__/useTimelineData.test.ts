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
    const linesFirst = [{ file: 'a', lines: 1 }];
    const linesSecond = [{ file: 'a', lines: 2 }];
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url === '/basic/api/commits/c2/lines') {
        return Promise.resolve({ json: () => Promise.resolve({ counts: linesFirst }) } as unknown as Response);
      }
      if (url === '/basic/api/commits/c1/lines?parent=c2') {
        return Promise.resolve({ json: () => Promise.resolve({ counts: linesSecond }) } as unknown as Response);
      }
      if (url.startsWith('/basic/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

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
    expect(calls).toHaveLength(3);
  });

  it('ignores outdated responses', async () => {
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1 }];
    const linesSecond = [{ file: 'a', lines: 2 }];
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
      if (url === '/outdated/api/commits/c2/lines') {
        return new Promise<Response>((resolve) => {
          resolveFirst = () => resolve({
            json: () => Promise.resolve({ counts: linesFirst }),
          } as unknown as Response);
        });
      }
      if (url === '/outdated/api/commits/c1/lines?parent=c2') {
        return Promise.resolve({
          json: () => Promise.resolve({ counts: linesSecond }),
        } as unknown as Response);
      }
      if (url.startsWith('/outdated/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const base = '/outdated';
    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: base }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));

    rerender({ ts: 2000 });

    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(2);

    resolveFirst?.();

    await waitFor(() => expect(result.current.lineCounts).toEqual(linesSecond));

    const lineCalls = (global.fetch as jest.Mock).mock.calls.filter(
      ([u]) => typeof u === 'string' && u.includes('/lines'),
    );
    expect(lineCalls).toHaveLength(2);
  });

  it('maps renamed files to previous names', async () => {
    const commits = [
      { id: 'c1', message: 'rename', timestamp: 2 },
      { id: 'c0', message: 'init', timestamp: 1 },
    ];
    const linesInit = [{ file: 'a.txt', lines: 1 }];
    const linesRenamed = [{ file: 'b.txt', lines: 1 }];
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url === '/rename/api/commits/c0/lines') {
        return Promise.resolve({ json: () => Promise.resolve({ counts: linesInit }) } as unknown as Response);
      }
      if (url === '/rename/api/commits/c1/lines?parent=c0') {
        return Promise.resolve({
          json: () => Promise.resolve({ counts: linesRenamed, renames: { 'b.txt': 'a.txt' } }),
        } as unknown as Response);
      }
      if (url.startsWith('/rename/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts, baseUrl: '/rename' }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.lineCounts).toEqual(linesInit));

    rerender({ ts: 2000 });
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual([{ file: 'a.txt', lines: 1 }]),
    );
  });
});

