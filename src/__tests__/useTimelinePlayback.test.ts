/** @jest-environment jsdom */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimelinePlayback } from '../client/hooks/useTimelinePlayback';
import { usePlayer } from '../client/hooks';
import { usePageVisibility } from '../client/hooks/usePageVisibility';

jest.mock('../client/hooks', () => {
  const actual: Record<string, unknown> = jest.requireActual('../client/hooks');
  return { ...actual, usePlayer: jest.fn() } as Record<string, unknown>;
});

jest.mock('../client/hooks/usePageVisibility');

const usePlayerMock = usePlayer as jest.MockedFunction<typeof usePlayer>;
const usePageVisibilityMock = usePageVisibility as jest.MockedFunction<
  typeof usePageVisibility
>;

const mockPlayer = {
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  togglePlay: jest.fn(),
  isPlaying: jest.fn(() => true),
};

const visibility = { value: false };

beforeEach(() => {
  usePlayerMock.mockReturnValue(mockPlayer);
  usePageVisibilityMock.mockImplementation(() => visibility.value);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useTimelinePlayback', () => {
  it('forwards options and manages timestamp', async () => {
    const commits = [
      { commit: { message: 'a', committer: { timestamp: 2 } } },
      { commit: { message: 'b', committer: { timestamp: 1 } } },
    ];
    const json = jest.fn((input: string) => {
      if (input.startsWith('/api/commits')) return Promise.resolve(commits);
      if (input.startsWith('/api/lines')) return Promise.resolve([]);
      return Promise.reject(new Error(`unexpected ${input}`));
    });

    const { result } = renderHook(() =>
      useTimelinePlayback({ duration: 1, json }),
    );

    await waitFor(() => expect(result.current.ready).toBe(true));

    const options =
      usePlayerMock.mock.calls[usePlayerMock.mock.calls.length - 1]![0] as {
        duration: number;
        start: number;
        end: number;
        getSeek: () => number;
        setSeek: (n: number) => void;
      };

    expect(options.duration).toBe(1);
    expect(options.start).toBe(1000);
    expect(options.end).toBe(2000);

    void act(() => {
      options.setSeek(5);
    });
    expect(result.current.timestamp).toBe(5);
  });

  it('responds to visibility changes', () => {
    const { rerender } = renderHook(() =>
      useTimelinePlayback({ duration: 1 }),
    );

    visibility.value = true;
    rerender();
    expect(mockPlayer.pause).toHaveBeenCalled();

    visibility.value = false;
    rerender();
    expect(mockPlayer.resume).toHaveBeenCalled();
  });

  it('sets timestamp after commits load', async () => {
    const commits = [
      { commit: { message: 'a', committer: { timestamp: 2 } } },
      { commit: { message: 'b', committer: { timestamp: 1 } } },
    ];
    const json = jest.fn((input: string) => {
      if (input.startsWith('/api/commits')) return Promise.resolve(commits);
      if (input.startsWith('/api/lines')) return Promise.resolve([]);
      return Promise.reject(new Error(`unexpected ${input}`));
    });

    const { result } = renderHook(() =>
      useTimelinePlayback({ duration: 1, json }),
    );

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.timestamp).toBe(1000);
  });
});
