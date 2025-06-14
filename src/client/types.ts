export interface Commit {
  commit: {
    message: string;
    committer: {
      timestamp: number;
    };
  };
}

export interface LineCount {
  file: string;
  lines: number;
}
