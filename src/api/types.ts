import type { Commit, LineCount } from '../client/types';

export interface ApiError {
  error: string;
}

export interface CommitsResponse {
  commits: Commit[];
}

export interface LineCountsResponse {
  counts: LineCount[];
}
