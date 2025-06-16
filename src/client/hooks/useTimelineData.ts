/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildWsUrl } from '../ws';
import { fetchCommits } from '../api';
import type { Commit, LineCount } from '../types';
import type { LineCountsResponse, ApiError } from '../../api/types';

const cache = new Map<string, () => Commit[]>();
const resourceKey = (baseUrl?: string) => baseUrl ?? '';

const createResource = <T,>(fn: () => Promise<T>): (() => T) => {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;
  const suspender = fn().then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      error = e;
    },
  );
  return () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (status === 'pending') throw suspender;
    if (status === 'error') {
      const err = error instanceof Error ? error : new Error(String(error));
      throw err;
    }
    return result;
  };
};

const readCommits = (baseUrl?: string): Commit[] => {
  const k = resourceKey(baseUrl);
  let resource = cache.get(k);
  if (!resource) {
    resource = createResource(() => fetchCommits(baseUrl));
    cache.set(k, resource);
  }
  return resource();
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

  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const renameMapRef = useRef<Record<string, string>>({});
  const token = useRef(0);
  const processed = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const queuedRef = useRef<string | null>(null);
  const lastRequestRef = useRef<string | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const activeRef = useRef(true);

  const sendCurrent = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === 1 && lastRequestRef.current) {
      socketRef.current.send(lastRequestRef.current);
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
    if (socketRef.current || !activeRef.current) return;
    const socket = new WebSocket(buildWsUrl('/ws/lines', baseUrl));
    socket.addEventListener('open', sendCurrent);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', () => {
      socketRef.current = null;
      if (activeRef.current) {
        reconnectRef.current = setTimeout(connect, 1000);
      }
    });
    socketRef.current = socket;
  }, [baseUrl, handleMessage, sendCurrent]);

  const update = useCallback(
    (id: string, parent?: string) => {
      token.current += 1;
      connect();
      lastRequestRef.current = JSON.stringify({ id, parent, token: token.current });
      queuedRef.current = lastRequestRef.current;
      sendCurrent();
    },
    [connect, sendCurrent],
  );

  useEffect(() => {
    renameMapRef.current = {};
    setLineCounts([]);
    token.current += 1;
    processed.current = token.current;
    activeRef.current = false;
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    socketRef.current?.close();
    activeRef.current = true;
  }, [baseUrl]);

  useEffect(
    () => () => {
      activeRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
      token.current += 1;
      processed.current = token.current;
    },
    [],
  );

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
