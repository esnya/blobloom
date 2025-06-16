export interface Commit {
  message: string;
  timestamp: number;
}

export interface LineCount {
  file: string;
  lines: number;
}
