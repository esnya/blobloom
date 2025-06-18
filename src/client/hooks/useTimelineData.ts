// eslint-disable-next-line no-restricted-syntax
import { useEffect, useRef, useState } from 'react';
import type { Commit, LineCount } from '../types';
import { TimelineDataManager, TimelineDataOptions } from '../logic/TimelineDataManager';



export const useTimelineData = ({ baseUrl, timestamp }: TimelineDataOptions) => {
  const [state, setState] = useState<{ commits: Commit[]; lineCounts: LineCount[]; start: number; end: number; ready: boolean }>({
    commits: [],
    lineCounts: [],
    start: 0,
    end: 0,
    ready: false,
  });
  // eslint-disable-next-line no-restricted-syntax
  const managerRef = useRef<TimelineDataManager | null>(null);

  if (!managerRef.current) {
    const opts: TimelineDataOptions = { timestamp };
    if (baseUrl !== undefined) opts.baseUrl = baseUrl;
    managerRef.current = new TimelineDataManager(opts, setState);
  } else {
    const opts: TimelineDataOptions = { timestamp };
    if (baseUrl !== undefined) opts.baseUrl = baseUrl;
    managerRef.current.updateOptions(opts);
  }

  useEffect(() => {
    if (state.commits.length === 0) {
      managerRef.current?.update(Number.MAX_SAFE_INTEGER);
    }
  }, [state.commits.length]);

  useEffect(() => {
    const ts = timestamp === 0 ? state.start : timestamp;
    if (ts === 0) return;
    if (timestamp === 0 && (managerRef.current?.isWaiting() || managerRef.current?.hasPending())) return;
    managerRef.current?.update(ts);
  }, [timestamp, state.start]);

  useEffect(() => () => managerRef.current?.dispose(), []);

  return state;
};
