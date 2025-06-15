import { useEffect, useState } from 'react';
import { usePlayer } from './index';
import { usePageVisibility } from './usePageVisibility';
import { fetchCommits, fetchLineCounts, type JsonFetcher } from '../api';
import type { Commit, LineCount } from '../types';
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
  const [commits, setCommits] = useState<Commit[]>([]);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ready, setReady] = useState(false);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    if (!json) return;
    void (async () => {
      const data = await fetchCommits(json);
      setCommits(data);
      if (data.length) {
        const s = data[data.length - 1]!.commit.committer.timestamp * 1000;
        const e = data[0]!.commit.committer.timestamp * 1000;
        setStart(s);
        setEnd(e);
        setTimestamp(s);
      }
      setReady(true);
    })();
  }, [json]);

  useEffect(() => {
    if (!json || !ready) return;
    void (async () => {
      const counts = await fetchLineCounts(json, timestamp);
      setLineCounts(counts);
    })();
  }, [json, ready, timestamp]);

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
