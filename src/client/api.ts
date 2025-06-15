import type { Commit, LineCount } from './types';

export type JsonFetcher = (input: string) => Promise<unknown>;

export const fetchCommits = async (
  json: JsonFetcher,
): Promise<Commit[]> => {
  return (await json('/api/commits')) as Commit[];
};

export const fetchLineCounts = async (
  json: JsonFetcher,
  timestamp?: number,
): Promise<LineCount[]> => {
  const url = timestamp ? `/api/lines?ts=${timestamp}` : '/api/lines';
  return (await json(url)) as LineCount[];
};
