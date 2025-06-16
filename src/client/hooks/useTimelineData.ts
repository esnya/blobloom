import { useEffect, useState } from 'react';
import { fetchCommits, fetchLineCounts } from '../api';
import type { Commit, LineCount } from '../types';

interface TimelineDataOptions {
  baseUrl?: string | undefined;
  timestamp: number;
}

export const useTimelineData = ({ baseUrl, timestamp }: TimelineDataOptions) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const data = await fetchCommits(baseUrl);
      setCommits(data);
      if (data.length) {
        const s = data[data.length - 1]!.timestamp * 1000;
        const e = data[0]!.timestamp * 1000;
        setStart(s);
        setEnd(e);
      }
      setReady(true);
    })();
  }, [baseUrl]);

  useEffect(() => {
    if (!ready) return;
    void fetchLineCounts(timestamp, baseUrl).then(setLineCounts);
  }, [timestamp, ready, baseUrl]);

  return { commits, lineCounts, start, end, ready };
};
