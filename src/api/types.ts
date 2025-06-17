import type { Commit, LineCount } from '../client/types';

export interface ApiError {
  error: string;
}

export interface CommitsResponse {
  commits: Commit[];
}

export interface LineCountsResponse {
  counts: LineCount[];
  commits: Commit[];
  renames?: Record<string, string> | undefined;
  token?: number | undefined;
}
