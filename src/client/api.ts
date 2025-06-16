import type { Commit, LineCount } from './types';
import type { ApiError, CommitsResponse, LineCountsResponse } from '../api/types';

export type JsonFetcher = (input: string) => Promise<unknown>;

export const fetchCommits = async (
  json: JsonFetcher,
): Promise<Commit[]> => {
  const data = (await json('/api/commits')) as CommitsResponse | ApiError;
  if ('commits' in data) {
    return data.commits;
  }
  throw new Error(data.error);
};

export const fetchLineCounts = async (
  json: JsonFetcher,
  timestamp?: number,
): Promise<LineCount[]> => {
  const url =
    timestamp === undefined ? '/api/lines' : `/api/lines?ts=${timestamp}`;
  const result = (await json(url)) as LineCountsResponse | ApiError;
  if ('counts' in result) {
    return result.counts;
  }
  throw new Error(result.error);
};
