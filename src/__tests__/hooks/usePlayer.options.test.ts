/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import * as playerHook from '../../client/hooks/usePlayer';

const { usePlayer } = playerHook;

let createPlayer: jest.SpiedFunction<typeof playerHook.createPlayer>;

describe('usePlayer options', () => {
  const mockPlayer = {
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    togglePlay: jest.fn(),
    isPlaying: jest.fn(() => false),
  };

  beforeEach(() => {
    createPlayer = jest
      .spyOn(playerHook, 'createPlayer')
      .mockImplementation((opts: playerHook.PlayerOptions) => {
        const cb = opts.onPlayStateChange as ((p: boolean) => void) | undefined;
        cb?.(true);
        return mockPlayer;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forwards raf and now and play state callback', () => {
    const raf = jest.fn();
    const now = jest.fn();
    const onPlayStateChange = jest.fn();

    renderHook(() =>
      usePlayer({
        getSeek: () => 0,
        setSeek: () => undefined,
        duration: 1,
        start: 0,
        end: 2,
        raf,
        now,
        onPlayStateChange,
      }),
    );

    const call = createPlayer.mock.calls[0] as [
      {
        raf?: unknown;
        now?: unknown;
        onPlayStateChange?: unknown;
      },
    ];
    const args = call[0];
    expect(args.raf).toBe(raf);
    expect(args.now).toBe(now);
    expect(typeof args.onPlayStateChange).toBe('function');
    expect(onPlayStateChange).toHaveBeenCalledWith(true);
  });
});
