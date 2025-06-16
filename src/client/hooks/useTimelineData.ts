/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readCommits } from '../commitsResource';
import { buildWsUrl } from '../ws';
import type { LineCount } from '../types';
import type { LineCountsResponse, ApiError } from '../../api/types';

const useLineCountsQueue = (baseUrl?: string) => {
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const renameMapRef = useRef<Record<string, string>>({});
  const token = useRef(0);
  const processed = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const queuedRef = useRef<string | null>(null);

  const sendQueued = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === 1 && queuedRef.current) {
      socketRef.current.send(queuedRef.current);
      queuedRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((ev: MessageEvent) => {
    const payload = JSON.parse(ev.data as string) as (LineCountsResponse | ApiError) & { token?: number };
    if (
      'counts' in payload &&
      payload.token !== undefined &&
      payload.token > processed.current &&
      payload.counts.length > 0
    ) {
      processed.current = payload.token;
      if (payload.renames) {
        for (const [to, from] of Object.entries(payload.renames)) {
          renameMapRef.current[to] = renameMapRef.current[from] ?? from;
        }
      }
      const mapped = payload.counts.map((c) => ({
        ...c,
        file: renameMapRef.current[c.file] ?? c.file,
      }));
      setLineCounts(mapped);
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) return;
    const socket = new WebSocket(buildWsUrl('/ws/lines', baseUrl));
    socket.addEventListener('open', sendQueued);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', () => {
      socketRef.current = null;
    });
    socketRef.current = socket;
  }, [baseUrl, handleMessage, sendQueued]);

  const update = useCallback(
    (id: string, parent?: string) => {
      token.current += 1;
      connect();
      queuedRef.current = JSON.stringify({ id, parent, token: token.current });
      sendQueued();
    },
    [connect, sendQueued],
  );

  useEffect(() => {
    renameMapRef.current = {};
    setLineCounts([]);
    token.current += 1;
    processed.current = token.current;
    socketRef.current?.close();
  }, [baseUrl]);

  useEffect(
    () => () => {
      socketRef.current?.close();
      token.current += 1;
      processed.current = token.current;
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
