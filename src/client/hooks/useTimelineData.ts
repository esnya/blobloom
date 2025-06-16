/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchLineCounts } from '../api';
import { readCommits } from '../commitsResource';
import type { LineCount } from '../types';

const useLineCountsQueue = (baseUrl?: string) => {
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});
  const pending = useRef<{ id: string; parent?: string } | null>(null);
  const inflight = useRef(false);
  const token = useRef(0);

  const run = useCallback(() => {
    if (inflight.current || !pending.current) return;
    inflight.current = true;
    const { id, parent } = pending.current;
    pending.current = null;
    const current = token.current;
    void fetchLineCounts(id, baseUrl, parent)
      .then(({ counts, renames }) => {
        if (token.current !== current || pending.current) return;
        let nextMap: Record<string, string> = {};
        setRenameMap((prev) => {
          nextMap = { ...prev };
          if (renames) {
            for (const [to, from] of Object.entries(renames)) {
              nextMap[to] = nextMap[from] ?? from;
            }
          }
          return nextMap;
        });
        const mapped = counts.map((c) => ({
          ...c,
          file: nextMap[c.file] ?? c.file,
        }));
        setLineCounts(mapped);
      })
      .finally(() => {
        inflight.current = false;
        run();
      });
  }, [baseUrl]);

  const update = useCallback(
    (id: string, parent?: string) => {
      pending.current = parent ? { id, parent } : { id };
      run();
    },
    [run],
  );

  useEffect(() => {
    setRenameMap({});
    setLineCounts([]);
    token.current += 1;
  }, [baseUrl]);

  useEffect(
    () => () => {
      token.current += 1;
    },
    [],
  );

  return { lineCounts, update };
};

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

  const { lineCounts, update } = useLineCountsQueue(baseUrl);

  useEffect(() => {
    const ts = timestamp === 0 ? start : timestamp;
    if (ts === 0) return;
    const index = commits.findIndex((c) => c.timestamp * 1000 <= ts);
    if (index === -1) return;
    const commit = commits[index]!;
    const parent = commits[index + 1]?.id;
    update(commit.id, parent);
  }, [timestamp, start, commits, update]);

  return { commits, lineCounts, start, end };
};
