export interface Commit {
  id: string;
  message: string;
  timestamp: number;
}

export interface LineCount {
  file: string;
  lines: number;
  added: number;
  removed: number;
}

export interface LineCountsResult {
  counts: LineCount[];
  renames?: Record<string, string> | undefined;
}
