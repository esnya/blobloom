/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { usePlayer } from '../../client/hooks/usePlayer';

describe('usePlayer', () => {
  const mockPlayer = {
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    togglePlay: jest.fn(),
    isPlaying: jest.fn(() => true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates player and exposes controls', () => {
    const getSeek = jest.fn(() => 0);
    const setSeek = jest.fn();
    const factory = jest.fn(() => mockPlayer);

    const { result } = renderHook(() =>
      usePlayer({
        getSeek,
        setSeek,
        duration: 1,
        start: 0,
        end: 10,
        playerFactory: factory,
      }),
    );

    expect(factory).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 1, start: 0, end: 10 }),
    );

    act(() => {
      result.current.pause();
      result.current.resume();
      result.current.stop();
      result.current.togglePlay();
    });

    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(mockPlayer.resume).toHaveBeenCalled();
    expect(mockPlayer.stop).toHaveBeenCalled();
    expect(result.current.isPlaying()).toBe(true);
  });

  it('pauses on unmount', () => {
    const factory = jest.fn(() => mockPlayer);
    const { unmount } = renderHook(() =>
      usePlayer({
        getSeek: () => 0,
        setSeek: () => undefined,
        duration: 1,
        start: 0,
        end: 10,
        playerFactory: factory,
      }),
    );
    unmount();
    expect(mockPlayer.pause).toHaveBeenCalled();
  });
});
