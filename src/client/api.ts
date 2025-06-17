import type { Commit, LineCountsResult } from './types';
import type { ApiError, CommitsResponse, LineCountsResponse } from '../api/types';
import { buildWsUrl } from './ws';

export const fetchCommits = async (baseUrl = ''): Promise<Commit[]> => {
  const response = await fetch(`${baseUrl}/api/commits`);
  const data = (await response.json()) as CommitsResponse | ApiError;
  if ('commits' in data) {
    return data.commits;
  }
  throw new Error(data.error);
};

export const fetchLineCounts = async (
  timestamp: number,
  baseUrl = '',
  parent?: string,
): Promise<LineCountsResult> => {
  const url = buildWsUrl('/ws/line-counts', baseUrl);
  return new Promise<LineCountsResult>((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ timestamp, parent }));
    });
    socket.addEventListener('message', (ev) => {
      const result = JSON.parse(ev.data as string) as
        | { type: 'data'; counts: LineCountsResponse['counts']; renames?: Record<string, string> }
        | { type: 'range' | 'done' | 'error'; error?: string };
      if (result.type !== 'data') return;
      socket.close();
      if (result.counts.length > 0) {
        resolve({ counts: result.counts, renames: result.renames });
      } else {
        reject(new Error('No line counts'));
      }
    });
    socket.addEventListener('error', () => {
      reject(new Error('WebSocket error'));
    });
  });
};
