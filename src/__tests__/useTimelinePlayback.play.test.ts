/** @jest-environment jsdom */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimelinePlayback } from '../client/hooks/useTimelinePlayback';

// Integration test verifying playback used by App.tsx

describe('useTimelinePlayback playback', () => {
  it('advances timestamp each frame until finished', async () => {
    const commits = [
      { commit: { message: 'b', committer: { timestamp: 5 } } },
      { commit: { message: 'a', committer: { timestamp: 0 } } },
    ];
    const json = jest.fn((input: string) => {
      if (input.startsWith('/api/commits')) return Promise.resolve(commits);
      if (input.startsWith('/api/lines')) return Promise.resolve([]);
      return Promise.reject(new Error(`unexpected ${input}`));
    });

    const tickCbs: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      if (cb.name === 'tick') {
        tickCbs.push(cb);
      }
      return 1;
    };
    const now = () => 0;

    const { result } = renderHook(() =>
      useTimelinePlayback({ duration: 5, json, raf, now }),
    );

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      tickCbs.length = 0;
      result.current.togglePlay();
    });

    act(() => tickCbs.shift()?.(0));
    expect(result.current.timestamp).toBe(0);

    act(() => tickCbs.shift()?.(2500));
    expect(result.current.timestamp).toBeCloseTo(2500);

    act(() => tickCbs.shift()?.(5000));
    expect(result.current.timestamp).toBe(5000);
    expect(result.current.isPlaying()).toBe(false);
  });
});
