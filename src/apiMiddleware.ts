import express from 'express';
import * as git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';
import { getLineCounts, LineCount } from './lineCounts';

export interface CreateApiMiddlewareOptions {
  repo?: string;
  branch?: string;
  ignore?: string[];
}

export const createApiMiddleware = async ({ repo = process.cwd(), branch: inputBranch, ignore = [] }: CreateApiMiddlewareOptions = {}) => {
  const repoDir = path.resolve(repo);
  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    throw new Error(`${repoDir} is not a git repository.`);
  }

  const branches = await git.listBranches({ fs, dir: repoDir });
  let branch = inputBranch;
  if (!branch) {
    branch = ['main', 'master', 'trunk'].find((b) => branches.includes(b)) ?? branches[0];
  }
  if (!branch) {
    throw new Error('No branch found.');
  }

  const commits = await git.log({ fs, dir: repoDir, ref: branch });
  const lineCounts: LineCount[] = await getLineCounts({ dir: repoDir, ref: branch, ignore });

  const router = express.Router();

  router.get('/api/commits', (_, res) => {
    res.json(commits);
  });

  router.get('/api/lines', async (req, res) => {
    const tsParam = req.query.ts as string | undefined;
    if (tsParam) {
      const ts = Number(tsParam) / 1000;
      const commit = commits.find((c) => c.commit.committer.timestamp <= ts);
      if (!commit) {
        res.status(404).json({ error: 'Commit not found' });
        return;
      }
      try {
        const counts = await getLineCounts({ dir: repoDir, ref: commit.oid, ignore });
        res.json(counts);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    } else {
      res.json(lineCounts);
    }
  });

  return router;
};
