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
    isPlaying: jest.fn(() => true),
  };

  beforeEach(() => {
    (createPlayer as jest.Mock).mockReturnValue(mockPlayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates player and exposes controls', () => {
    const button = document.createElement('button');
    const seek = document.createElement('input');
    const duration = document.createElement('input');

    const { result } = renderHook(() =>
      usePlayer(button, { seekEl: seek, durationEl: duration, start: 0, end: 10 }),
    );

    expect(createPlayer).toHaveBeenCalledWith({
      seek,
      duration,
      playButton: button,
      start: 0,
      end: 10,
    });

    act(() => {
      result.current.pause();
      result.current.resume();
      result.current.stop();
    });

    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(mockPlayer.resume).toHaveBeenCalled();
    expect(mockPlayer.stop).toHaveBeenCalled();
    expect(result.current.isPlaying()).toBe(true);
  });

  it('pauses on unmount', () => {
    const button = document.createElement('button');
    const seek = document.createElement('input');
    const duration = document.createElement('input');

    const { unmount } = renderHook(() =>
      usePlayer(button, { seekEl: seek, durationEl: duration, start: 0, end: 10 }),
    );
    unmount();
    expect(mockPlayer.pause).toHaveBeenCalled();
  });
});
