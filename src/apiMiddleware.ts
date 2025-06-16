import express from 'express';
import { appSettings } from './appSettings';
import * as git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';
import { getLineCounts } from './lineCounts';
import { defaultIgnore } from './ignoreDefaults';

const resolveBranch = async (
  dir: string,
  inputBranch: string | undefined,
): Promise<string> => {
  const branches = await git.listBranches({ fs, dir });
  let branch = inputBranch;
  if (!branch) {
    branch = ['main', 'master', 'trunk'].find((b) => branches.includes(b)) ?? branches[0];
  }
  if (!branch) {
    throw new Error('No branch found.');
  }
  return branch;
};

export const apiMiddleware = express.Router();

const repoDir = (app: express.Application): string =>
  path.resolve((app.get(appSettings.repo.description!) as string | undefined) ?? process.cwd());

const ignorePatterns = (app: express.Application): string[] =>
  (app.get(appSettings.ignore.description!) as string[] | undefined) ?? [...defaultIgnore];

apiMiddleware.get('/api/commits', async (req, res) => {
  const app = req.app;
  const dir = repoDir(app);
  if (!fs.existsSync(path.join(dir, '.git'))) {
    res.status(500).json({ error: `${dir} is not a git repository.` });
    return;
  }
  try {
    const branch = await resolveBranch(
      dir,
      app.get(appSettings.branch.description!) as string | undefined,
    );
    const commits = await git.log({ fs, dir, ref: branch });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

apiMiddleware.get('/api/lines', async (req, res) => {
  const app = req.app;
  const dir = repoDir(app);
  if (!fs.existsSync(path.join(dir, '.git'))) {
    res.status(500).json({ error: `${dir} is not a git repository.` });
    return;
  }
  try {
    const branch = await resolveBranch(
      dir,
      app.get(appSettings.branch.description!) as string | undefined,
    );
    const tsParam = req.query.ts as string | undefined;
    const ignore = ignorePatterns(app);

    const baseCounts = await getLineCounts({ dir, ref: branch, ignore });
    if (tsParam) {
      const ts = Number(tsParam) / 1000;
      const commits = await git.log({ fs, dir, ref: branch });
      const commit = commits.find((c) => c.commit.committer.timestamp <= ts);
      if (!commit) {
        res.status(404).json({ error: 'Commit not found' });
        return;
      }
      const counts = await getLineCounts({ dir, ref: commit.oid, ignore });
      res.json(counts);
    } else {
      res.json(baseCounts);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
