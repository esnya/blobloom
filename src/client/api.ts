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
  const query = parent ? `?parent=${parent}` : '';
  const response = await fetch(`${baseUrl}/api/commits/${commitId}/lines${query}`);
  const result = (await response.json()) as LineCountsResponse | ApiError;
  if ('counts' in result && result.counts.length > 0) {
    return result;
  }
  const message = 'error' in result ? result.error : 'No line counts';
  throw new Error(message);
};
