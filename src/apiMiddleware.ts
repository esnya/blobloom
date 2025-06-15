import express from 'express';
import * as git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';
import { getLineCounts, LineCount } from './lineCounts';

const router = express.Router();

const getSettings = async (req: express.Request) => {
  const repo = path.resolve(req.app.get('repo') ?? process.cwd());
  if (!fs.existsSync(path.join(repo, '.git'))) {
    throw new Error(`${repo} is not a git repository.`);
  }

  const branches = await git.listBranches({ fs, dir: repo });
  let branch = req.app.get('branch') as string | undefined;
  if (!branch) {
    branch = ['main', 'master', 'trunk'].find((b) => branches.includes(b)) ?? branches[0];
  }
  if (!branch) {
    throw new Error('No branch found.');
  }

  const ignore = (req.app.get('ignore') as string[]) ?? [];

  return { repo, branch, ignore };
};

router.get('/api/commits', async (req, res) => {
  try {
    const { repo, branch } = await getSettings(req);
    const commits = await git.log({ fs, dir: repo, ref: branch });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/api/lines', async (req, res) => {
  try {
    const { repo, branch, ignore } = await getSettings(req);
    const commits = await git.log({ fs, dir: repo, ref: branch });
    const tsParam = req.query.ts as string | undefined;
    if (tsParam) {
      const ts = Number(tsParam) / 1000;
      const commit = commits.find((c) => c.commit.committer.timestamp <= ts);
      if (!commit) {
        res.status(404).json({ error: 'Commit not found' });
        return;
      }
      const counts = await getLineCounts({ dir: repo, ref: commit.oid, ignore });
      res.json(counts);
      return;
    }

    const lineCounts: LineCount[] = await getLineCounts({ dir: repo, ref: branch, ignore });
    res.json(lineCounts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export const apiMiddleware = router;
