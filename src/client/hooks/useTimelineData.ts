/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildWsUrl } from '../ws';
import { useWebSocket } from './useWebSocket';
import type { Commit, LineCount } from '../types';
import type { LineCountsResponse } from '../../api/types';


interface TimelineDataOptions {
  baseUrl?: string | undefined;
  timestamp: number;
}

export const useTimelineData = ({ baseUrl, timestamp }: TimelineDataOptions) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ready, setReady] = useState(false);

  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const renameMapRef = useRef<Record<string, string>>({});
  const token = useRef(0);
  const processed = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const waitingRef = useRef(false);
  const pendingRef = useRef<Array<{ data: string; token: number }>>([]);
  const currentTokenRef = useRef(0);
  const messageHandlerRef = useRef<(ev: MessageEvent) => void>(() => {});

  const { send, close } = useWebSocket({
    url: buildWsUrl('/ws/line-counts', baseUrl),
    onMessage: (ev) => messageHandlerRef.current(ev),
  });

  const sendMessage = useCallback(
    (payload: { data: string; token: number }) => {
      waitingRef.current = true;
      currentTokenRef.current = payload.token;
      send(payload.data);
    },
    [send],
  );

  const handleMessage = useCallback(
    (ev: MessageEvent) => {
      const payload = JSON.parse(ev.data as string) as {
        type?: string;
        token?: number;
        [key: string]: unknown;
      };
    if (payload.type === 'range') {
      setStart(payload.start as number);
      setEnd(payload.end as number);
      return;
    }
    if (payload.type === 'done') {
      if (payload.token === currentTokenRef.current) {
        waitingRef.current = false;
        if (pendingRef.current.length > 0) {
          const next = pendingRef.current.shift()!;
          setReady(false);
          sendMessage(next);
        } else {
          setReady(true);
        }
      }
      return;
    }
    if (payload.type === 'data') {
      if (Array.isArray(payload.commits)) {
        setCommits((prev) => {
          const map = new Map(prev.map((c) => [c.id, c] as const));
          for (const c of payload.commits as Commit[]) map.set(c.id, c);
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      }
      if (
        payload.token !== undefined &&
        payload.token > processed.current &&
        Array.isArray(payload.counts) &&
        payload.counts.length > 0
      ) {
        processed.current = payload.token;
        if (payload.renames) {
          for (const [to, from] of Object.entries(payload.renames as Record<string, string>)) {
            renameMapRef.current[to] = renameMapRef.current[from] ?? from;
          }
        }
        const mapped = (payload.counts as LineCountsResponse['counts']).map((c) => ({
          ...c,
          file: renameMapRef.current[c.file] ?? c.file,
        }));
        setLineCounts(mapped);
      }
    }
  },
    [sendMessage],
  );
  messageHandlerRef.current = handleMessage;

  const update = useCallback(
    (ts: number) => {
      if (lastTimestampRef.current === ts) return;
      token.current += 1;
      lastTimestampRef.current = ts;
      const payload = {
        data: JSON.stringify({ timestamp: ts, token: token.current }),
        token: token.current,
      };
      if (waitingRef.current) {
        pendingRef.current.push(payload);
      } else {
        setReady(false);
        sendMessage(payload);
      }
    },
    [sendMessage],
  );

  useEffect(() => {
    renameMapRef.current = {};
    setCommits([]);
    setLineCounts([]);
    setStart(0);
    setEnd(0);
    setReady(false);
    waitingRef.current = false;
    pendingRef.current = [];
    token.current += 1;
    processed.current = token.current;
    lastTimestampRef.current = null;
    close();
  }, [baseUrl, close]);

  useEffect(
    () => () => {
      close();
      token.current += 1;
      processed.current = token.current;
      lastTimestampRef.current = null;
      setReady(false);
      waitingRef.current = false;
      pendingRef.current = [];
    },
    [close],
  );

  useEffect(() => {
    if (commits.length === 0) {
      update(Number.MAX_SAFE_INTEGER);
    }
  }, [commits.length, update]);

  useEffect(() => {
    const ts = timestamp === 0 ? start : timestamp;
    if (ts === 0) return;
    update(ts);
  }, [timestamp, start, update]);

  return { commits, lineCounts, start, end, ready };
};
