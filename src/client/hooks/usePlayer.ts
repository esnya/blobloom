import { useCallback, useEffect, useState } from 'react';
import { useLatest } from './useLatest';

export interface PlayerOptions {
  getSeek: () => number;
  setSeek: (value: number) => void;
  duration: number;
  start: number;
  end: number;
  raf?: (cb: FrameRequestCallback) => number;
  now?: () => number;
  onPlayStateChange?: (playing: boolean) => void;
  playerFactory?: typeof createPlayer;
}

export const createPlayer = ({
  getSeek,
  setSeek,
  duration,
  start,
  end,
  raf = requestAnimationFrame,
  now = performance.now.bind(performance),
  onPlayStateChange,
}: PlayerOptions) => {
  let playing = false;
  let lastTime = 0;
  const forward = end >= start;
  const rangeStart = forward ? start : end;
  const rangeEnd = forward ? end : start;
  const direction = forward ? 1 : -1;

  const tick = (time: number): void => {
    if (!playing) {
      return;
    }
    const total = duration * 1000;
    const factor = (rangeEnd - rangeStart) / total;
    const dt = (time - lastTime) * factor * direction;
    lastTime = time;
    const next = Math.max(
      rangeStart,
      Math.min(rangeEnd, getSeek() + dt),
    );
    setSeek(next);
    if (
      (forward && next < rangeEnd) ||
      (!forward && next > rangeStart)
    ) {
      raf(tick);
    } else {
      setPlaying(false);
    }
  };

  const setPlaying = (state: boolean): void => {
    playing = state;
    if (playing) {
      lastTime = now();
      raf(tick);
    } else if (getSeek() >= end) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[debug] seekbar final update processed at', getSeek());
      }
    }
    onPlayStateChange?.(playing);
  };

  const togglePlay = (): void => {
    if (!playing && getSeek() >= end) {
      setSeek(start);
    }
    setPlaying(!playing);
  };

  const pause = (): void => setPlaying(false);
  const stop = (): void => {
    setPlaying(false);
    setSeek(start);
  };
  const resume = (): void => setPlaying(true);
  const isPlaying = (): boolean => playing;

  setSeek(start);

  return { togglePlay, pause, resume, stop, isPlaying } as const;
};

export const usePlayer = (options: PlayerOptions) => {
  const { onPlayStateChange, getSeek, setSeek, raf, now, playerFactory, ...rest } = options;
  const getSeekRef = useLatest(getSeek);
  const setSeekRef = useLatest(setSeek);
  const onPlayStateChangeRef = useLatest(onPlayStateChange);

  const [player, setPlayer] = useState<ReturnType<typeof createPlayer> | null>(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const factory = playerFactory ?? createPlayer;
    const instance = factory({
      getSeek: () => getSeekRef.current(),
      setSeek: (v) => setSeekRef.current(v),
      ...(raf ? { raf } : {}),
      ...(now ? { now } : {}),
      ...(onPlayStateChange
        ? { onPlayStateChange: (p) => onPlayStateChangeRef.current?.(p) }
        : {}),
      ...rest,
    });
    setPlayer(instance);
    return () => instance.pause();
  }, [rest.duration, rest.start, rest.end, raf, now, playerFactory]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const stop = useCallback(() => player?.stop(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const resume = useCallback(() => player?.resume(), [player]);
  const togglePlay = useCallback(() => player?.togglePlay(), [player]);
  const isPlaying = useCallback(() => player?.isPlaying() ?? false, [player]);

  return { stop, pause, resume, togglePlay, isPlaying };
};
