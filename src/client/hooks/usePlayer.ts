import { useCallback, useEffect, useState } from 'react';
import { useLatest } from './useLatest';
import { createPlayer } from '../player';
import type { PlayerOptions } from '../player';

export const usePlayer = (options: PlayerOptions) => {
  const { onPlayStateChange, getSeek, setSeek, raf, now, ...rest } = options;
  const getSeekRef = useLatest(getSeek);
  const setSeekRef = useLatest(setSeek);
  const onPlayStateChangeRef = useLatest(onPlayStateChange);

  const [player, setPlayer] = useState<ReturnType<typeof createPlayer> | null>(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const instance = createPlayer({
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
  }, [rest.duration, rest.start, rest.end, raf, now]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const stop = useCallback(() => player?.stop(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const resume = useCallback(() => player?.resume(), [player]);
  const togglePlay = useCallback(() => player?.togglePlay(), [player]);
  const isPlaying = useCallback(() => player?.isPlaying() ?? false, [player]);

  return { stop, pause, resume, togglePlay, isPlaying };
};
