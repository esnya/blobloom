/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { usePlayer } from '../client/hooks';
import { createPlayer } from '../client/player';

jest.mock('../client/player');

describe('usePlayer', () => {
  const mockPlayer = {
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    togglePlay: jest.fn(),
    isPlaying: jest.fn(() => true),
  };

  beforeEach(() => {
    (createPlayer as jest.Mock).mockReturnValue(mockPlayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates player and exposes controls', () => {
    const getSeek = jest.fn(() => 0);
    const setSeek = jest.fn();

    const { result } = renderHook(() =>
      usePlayer({ getSeek, setSeek, duration: 1, start: 0, end: 10 }),
    );

    expect(createPlayer).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 1, start: 0, end: 10 })
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
    const { unmount } = renderHook(() =>
      usePlayer({
        getSeek: () => 0,
        setSeek: () => undefined,
        duration: 1,
        start: 0,
        end: 10,
      }),
    );
    unmount();
    expect(mockPlayer.pause).toHaveBeenCalled();
  });
});
