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
      if (url === '/api/commits/c2/lines') {
        return Promise.resolve({ json: () => Promise.resolve({ counts: linesFirst }) } as unknown as Response);
      }
      if (url === '/api/commits/c1/lines') {
        return Promise.resolve({ json: () => Promise.resolve({ counts: linesSecond }) } as unknown as Response);
      }
      if (url.startsWith('/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts }),
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
        ([u]) => typeof u === 'string' && u.startsWith('/api/commits') && !u.includes('/lines'),
      ).length,
    ).toBe(1);
    expect(calls).toHaveLength(3);
  });

  it('ignores results from outdated requests', async () => {
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
      if (url === '/api/commits/c2/lines') {
        return new Promise<Response>((resolve) => {
          resolveFirst = () => resolve({
            json: () => Promise.resolve({ counts: linesFirst }),
          } as unknown as Response);
        });
      }
      if (url === '/api/commits/c1/lines') {
        return Promise.resolve({
          json: () => Promise.resolve({ counts: linesSecond }),
        } as unknown as Response);
      }
      if (url.startsWith('/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));

    rerender({ ts: 2000 });
    await waitFor(() => expect(result.current.lineCounts).toEqual(linesSecond));

    resolveFirst?.();
    await Promise.resolve();

    expect(result.current.lineCounts).toEqual(linesSecond);
  });

  it('applies outdated results if newer than current', async () => {
    const commits = [
      { id: 'c1', message: 'a', timestamp: 2 },
      { id: 'c2', message: 'b', timestamp: 1 },
    ];
    const linesFirst = [{ file: 'a', lines: 1 }];
    const linesSecond = [{ file: 'a', lines: 2 }];
    let resolveFirst: (() => void) | undefined;
    let resolveSecond: (() => void) | undefined;
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      if (url === '/api/commits/c2/lines') {
        return new Promise<Response>((resolve) => {
          resolveFirst = () =>
            resolve({
              json: () => Promise.resolve({ counts: linesFirst }),
            } as unknown as Response);
        });
      }
      if (url === '/api/commits/c1/lines') {
        return new Promise<Response>((resolve) => {
          resolveSecond = () =>
            resolve({
              json: () => Promise.resolve({ counts: linesSecond }),
            } as unknown as Response);
        });
      }
      if (url.startsWith('/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) } as unknown as Response);
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    }) as unknown as typeof fetch;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Suspense, { fallback: 'loading' }, children);

    const { result, rerender } = renderHook(
      ({ ts }) => useTimelineData({ timestamp: ts }),
      { initialProps: { ts: 0 }, wrapper },
    );

    await waitFor(() => expect(result.current.start).toBe(1000));

    rerender({ ts: 2000 });

    resolveFirst?.();
    await waitFor(() => expect(result.current.lineCounts).toEqual(linesFirst));

    resolveSecond?.();
    await waitFor(() => expect(result.current.lineCounts).toEqual(linesSecond));
  });
});

