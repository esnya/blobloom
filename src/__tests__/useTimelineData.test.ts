/** @jest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineData } from '../client/hooks/useTimelineData';

describe('useTimelineData', () => {
  it('fetches commits and line counts', async () => {
    const commits = [
      { commit: { message: 'a', committer: { timestamp: 2 } } },
      { commit: { message: 'b', committer: { timestamp: 1 } } },
    ];
    const linesFirst = [{ file: 'a', lines: 1 }];
    const linesSecond = [{ file: 'a', lines: 2 }];
    const json = jest.fn((input: string) => {
      if (input.startsWith('/api/commits')) return Promise.resolve({ commits });
      if (input === '/api/lines?ts=0') return Promise.resolve({ counts: linesFirst });
      if (input === '/api/lines?ts=1') return Promise.resolve({ counts: linesSecond });
      return Promise.reject(new Error(`unexpected ${input}`));
    });

    const { result, rerender } = renderHook(({ ts }) =>
      useTimelineData({ json, timestamp: ts }),
    { initialProps: { ts: 0 } });

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.start).toBe(1000);
    expect(result.current.end).toBe(2000);
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual(linesFirst),
    );

    rerender({ ts: 1 });
    await waitFor(() =>
      expect(result.current.lineCounts).toEqual(linesSecond),
    );

    expect(json.mock.calls.filter(([u]) => u.startsWith('/api/commits')).length).toBe(1);
    expect(json.mock.calls).toHaveLength(3);
  });
});

