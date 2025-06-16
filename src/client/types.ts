export interface Commit {
  id: string;
  message: string;
  timestamp: number;
}

export interface LineCount {
  file: string;
  lines: number;
}
