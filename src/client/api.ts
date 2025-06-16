import type { Commit, LineCountsResult } from './types';
import type { ApiError, CommitsResponse, LineCountsResponse } from '../api/types';

export const fetchCommits = async (baseUrl = ''): Promise<Commit[]> => {
  const response = await fetch(`${baseUrl}/api/commits`);
  const data = (await response.json()) as CommitsResponse | ApiError;
  if ('commits' in data) {
    return data.commits;
  }
  throw new Error(data.error);
};

export const fetchLineCounts = async (
  commitId: string,
  baseUrl = '',
  parent?: string,
): Promise<LineCountsResult> => {
  const protocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const origin = baseUrl.replace(/^https?:\/\//, '');
  const url = `${protocol}://${origin}/ws/lines`;
  return new Promise<LineCountsResult>((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ id: commitId, parent }));
    });
    socket.addEventListener('message', (ev) => {
      const result = JSON.parse(ev.data as string) as LineCountsResponse | ApiError;
      socket.close();
      if ('counts' in result && result.counts.length > 0) {
        resolve(result);
      } else {
        const message = 'error' in result ? result.error : 'No line counts';
        reject(new Error(message));
      }
    });
    socket.addEventListener('error', () => {
      reject(new Error('WebSocket error'));
    });
  });
};
