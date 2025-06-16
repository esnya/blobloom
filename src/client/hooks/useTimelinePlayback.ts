import { useEffect, useState } from 'react';
import { usePlayer } from './index';
import { usePageVisibility } from './usePageVisibility';
import { useTimelineData } from './useTimelineData';
import type { JsonFetcher } from '../api';
import type { PlayerOptions } from '../player';

interface TimelineOptions
  extends Omit<PlayerOptions, 'getSeek' | 'setSeek' | 'start' | 'end'> {
  json?: JsonFetcher;
  onVisibilityChange?: (hidden: boolean) => void;
}

export const useTimelinePlayback = ({
  duration,
  raf,
  now,
  onPlayStateChange,
  onVisibilityChange,
  json,
}: TimelineOptions) => {
  const [timestamp, setTimestamp] = useState(0);

  const { commits, lineCounts, start, end, ready } = useTimelineData({
    timestamp,
    ...(json ? { json } : {}),
  });

  useEffect(() => {
    if (ready) setTimestamp(start);
  }, [ready, start]);

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

  return {
    timestamp,
    setTimestamp,
    commits,
    lineCounts,
    start,
    end,
    ready,
    ...player,
  };
};
