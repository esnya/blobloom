/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { usePlayer } from '../client/hooks';
import { createPlayer } from '../client/player';

jest.mock('../client/player');

describe('usePlayer options', () => {
  const mockPlayer = {
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    togglePlay: jest.fn(),
    isPlaying: jest.fn(() => false),
  };

  beforeEach(() => {
    (createPlayer as jest.Mock).mockImplementation((opts: Record<string, unknown>) => {
      const cb = opts.onPlayStateChange as ((p: boolean) => void) | undefined;
      cb?.(true);
      return mockPlayer;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    const call = (createPlayer as jest.Mock).mock.calls[0] as [
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
