import { useEffect, useState } from 'react';
import { usePlayer } from './index';
import { usePageVisibility } from './usePageVisibility';
import type { PlayerOptions } from '../player';

interface TimelineOptions extends Omit<PlayerOptions, 'getSeek' | 'setSeek'> {
  onVisibilityChange?: (hidden: boolean) => void;
}

export const useTimelinePlayback = ({
  duration,
  start,
  end,
  raf,
  now,
  onPlayStateChange,
  onVisibilityChange,
}: TimelineOptions) => {
  const [timestamp, setTimestamp] = useState(start);

  useEffect(() => {
    setTimestamp(start);
  }, [start]);

  const hidden = usePageVisibility();
  const [wasPlaying, setWasPlaying] = useState(false);

  const player = usePlayer({
    getSeek: () => timestamp,
    setSeek: setTimestamp,
    ...(raf ? { raf } : {}),
    ...(now ? { now } : {}),
    ...(onPlayStateChange ? { onPlayStateChange } : {}),
    duration,
    start,
    end,
  });

  useEffect(() => {
    onVisibilityChange?.(hidden);
    if (hidden) {
      setWasPlaying(player.isPlaying());
      player.pause();
    } else if (wasPlaying) {
      player.resume();
    }
  }, [hidden, player, wasPlaying, onVisibilityChange]);

  return { timestamp, setTimestamp, ...player };
};
