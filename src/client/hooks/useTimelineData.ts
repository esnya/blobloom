import { useEffect, useState } from 'react';
import { fetchCommits, fetchLineCounts, type JsonFetcher } from '../api';
import type { Commit, LineCount } from '../types';

interface TimelineDataOptions {
  json?: JsonFetcher | undefined;
  timestamp: number;
}

export const useTimelineData = ({ json, timestamp }: TimelineDataOptions) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!json) return;
    void (async () => {
      const data = await fetchCommits(json);
      setCommits(data);
      if (data.length) {
        const timestamps = data.map((c) => c.commit.committer.timestamp * 1000);
        const s = Math.min(...timestamps);
        const e = Math.max(...timestamps);
        setStart(s);
        setEnd(e);
      }
      setReady(true);
    })();
  }, [json]);

  useEffect(() => {
    if (!json || !ready) return;
    void fetchLineCounts(json, timestamp).then(setLineCounts);
  }, [json, timestamp, ready]);

  return { commits, lineCounts, start, end, ready };
};
