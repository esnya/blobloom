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
        const s = data[data.length - 1]!.commit.committer.timestamp * 1000;
        const e = data[0]!.commit.committer.timestamp * 1000;
        setStart(s);
        setEnd(e);
      }
      setReady(true);
    })();
  }, [json]);

  useEffect(() => {
    if (!json || !ready) return;
    const ts = timestamp || start;
    void fetchLineCounts(json, ts).then(setLineCounts);
  }, [json, timestamp, ready, start]);

  return { commits, lineCounts, start, end, ready };
};
