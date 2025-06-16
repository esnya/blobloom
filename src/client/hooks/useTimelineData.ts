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
  const renameMapRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const ts = timestamp === 0 ? start : timestamp;
    if (ts === 0) return;
    const index = commits.findIndex((c) => c.timestamp * 1000 <= ts);
    if (index === -1) return;
    const commit = commits[index]!;
    const parent = commits[index + 1]?.id;
    let ignore = false;
    void fetchLineCounts(commit.id, baseUrl, parent).then(({ counts, renames }) => {
      if (ignore) return;
      if (renames) {
        for (const [to, from] of Object.entries(renames)) {
          renameMapRef.current[to] = renameMapRef.current[from] ?? from;
        }
      }
      const mapped = counts.map((c) => ({
        ...c,
        file: renameMapRef.current[c.file] ?? c.file,
      }));
      setLineCounts(mapped);
    });
    return () => {
      ignore = true;
    };
  }, [timestamp, start, baseUrl, commits]);

  return { commits, lineCounts, start, end };
};
