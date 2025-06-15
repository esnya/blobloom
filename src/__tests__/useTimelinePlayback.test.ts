/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
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
  it('forwards options and manages timestamp', () => {
  const { result } = renderHook(() =>
    useTimelinePlayback({ duration: 1, start: 0, end: 10 }),
  );

  const options = usePlayerMock.mock.calls[0]![0] as {
    duration: number;
    start: number;
    end: number;
    getSeek: () => number;
    setSeek: (n: number) => void;
  };
    expect(options.duration).toBe(1);
    expect(options.start).toBe(0);
    expect(options.end).toBe(10);
    expect(options.getSeek()).toBe(0);

    void act(() => {
      options.setSeek(5);
    });
    expect(result.current.timestamp).toBe(5);
  });

  it('responds to visibility changes', () => {
    const { rerender } = renderHook(() =>
      useTimelinePlayback({ duration: 1, start: 0, end: 10 }),
    );

    visibility.value = true;
    rerender();
    expect(mockPlayer.pause).toHaveBeenCalled();

    visibility.value = false;
    rerender();
    expect(mockPlayer.resume).toHaveBeenCalled();
  });

  it('resets timestamp when start changes', () => {
    const { result, rerender } = renderHook(
      ({ s }: { s: number }) =>
        useTimelinePlayback({ duration: 1, start: s, end: 10 }),
      { initialProps: { s: 0 } },
    );

    expect(result.current.timestamp).toBe(0);

    rerender({ s: 3 });
    expect(result.current.timestamp).toBe(3);
  });
});
