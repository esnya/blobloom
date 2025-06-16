import type { Commit, LineCount } from './types';
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
  timestamp?: number,
  baseUrl = '',
): Promise<LineCount[]> => {
  const path =
    timestamp === undefined ? '/api/lines' : `/api/lines?ts=${timestamp}`;
  const response = await fetch(`${baseUrl}${path}`);
  const result = (await response.json()) as LineCountsResponse | ApiError;
  if ('counts' in result && result.counts.length > 0) {
    return result.counts;
  }
  const message = 'error' in result ? result.error : 'No line counts';
  throw new Error(message);
};
