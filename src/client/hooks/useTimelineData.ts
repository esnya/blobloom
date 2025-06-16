/* eslint-disable no-restricted-syntax */
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const current = useRef(0);
  const requested = useRef(0);
  const unmounted = useRef(false);

  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    const ts = timestamp === 0 ? start : timestamp;
    if (ts === 0) return;
    const commit = commits.find((c) => c.timestamp * 1000 <= ts);
    if (!commit) return;
    requested.current = commit.timestamp;
    void fetchLineCounts(commit.id, baseUrl).then(({ counts }) => {
      if (unmounted.current) return;
      const tsCommit = commit.timestamp;
      if (tsCommit === requested.current) {
        current.current = tsCommit;
        setLineCounts(counts);
      } else if (
        requested.current > current.current &&
        tsCommit > current.current &&
        tsCommit < requested.current
      ) {
        current.current = tsCommit;
        setLineCounts(counts);
      }
    });
  }, [timestamp, start, baseUrl, commits]);

  return { commits, lineCounts, start, end };
};
