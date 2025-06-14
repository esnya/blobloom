export interface Commit {
  commit: {
    message: string;
    committer: {
      timestamp: number;
    };
  };
}
