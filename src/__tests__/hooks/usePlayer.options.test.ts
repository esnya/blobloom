/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { usePlayer } from '../../client/hooks/usePlayer';

describe('usePlayer options', () => {
  const mockPlayer = {
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    togglePlay: jest.fn(),
    isPlaying: jest.fn(() => false),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('forwards raf and now and play state callback', () => {
    const raf = jest.fn();
    const now = jest.fn();
    const onPlayStateChange = jest.fn();
    const factory = jest.fn((opts: import('../../client/hooks/usePlayer').PlayerOptions) => {
      const cb = opts.onPlayStateChange as ((p: boolean) => void) | undefined;
      cb?.(true);
      return mockPlayer;
    });

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
        playerFactory: factory,
      }),
    );

    const args = factory.mock.calls[0]![0] as {
      raf?: unknown;
      now?: unknown;
      onPlayStateChange?: unknown;
    };
    expect(args.raf).toBe(raf);
    expect(args.now).toBe(now);
    expect(typeof args.onPlayStateChange).toBe('function');
    expect(onPlayStateChange).toHaveBeenCalledWith(true);
  });
});
