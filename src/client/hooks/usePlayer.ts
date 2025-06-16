import { useCallback, useEffect, useState } from 'react';
import { createPlayer } from '../player';
import type { PlayerOptions } from '../player';

export const usePlayer = (options: PlayerOptions) => {
  const { onPlayStateChange, getSeek, setSeek, raf, now, ...rest } = options;
  const [refs] = useState(() => ({
    getSeek,
    setSeek,
    onPlayStateChange,
  }));

  useEffect(() => {
    refs.getSeek = getSeek;
  }, [getSeek, refs]);

  useEffect(() => {
    refs.setSeek = setSeek;
  }, [setSeek, refs]);

  useEffect(() => {
    refs.onPlayStateChange = onPlayStateChange;
  }, [onPlayStateChange, refs]);

  const [player, setPlayer] = useState<ReturnType<typeof createPlayer> | null>(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const instance = createPlayer({
      getSeek: () => refs.getSeek(),
      setSeek: (v) => refs.setSeek(v),
      ...(raf ? { raf } : {}),
      ...(now ? { now } : {}),
      ...(onPlayStateChange
        ? { onPlayStateChange: (p) => refs.onPlayStateChange?.(p) }
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
