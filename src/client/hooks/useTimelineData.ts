import { useEffect, useMemo, useState } from 'react';
import { fetchLineCounts } from '../api';
import { readCommits } from '../commitsResource';
import type { LineCount } from '../types';

interface TimelineDataOptions {
  baseUrl?: string | undefined;
  timestamp: number;
}

export const useTimelineData = ({ baseUrl, timestamp }: TimelineDataOptions) => {
  const commits = readCommits(baseUrl);

  const start = useMemo(
    () => (commits.length ? commits[commits.length - 1]!.timestamp * 1000 : 0),
    [commits],
  );
  const end = useMemo(
    () => (commits.length ? commits[0]!.timestamp * 1000 : 0),
    [commits],
  );

  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);

  useEffect(() => {
    const ts = timestamp === 0 ? start : timestamp;
    if (ts === 0) return;
    const commit = commits.find((c) => c.timestamp * 1000 <= ts);
    if (!commit) return;
    let ignore = false;
    void fetchLineCounts(commit.id, baseUrl).then(({ counts }) => {
      if (!ignore) setLineCounts(counts);
    });
    return () => {
      ignore = true;
    };
  }, [timestamp, start, baseUrl, commits]);

  return { commits, lineCounts, start, end };
};
