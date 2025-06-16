import express from 'express';
import { z } from 'zod';
import { appSettings } from './app-settings';
import * as git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';
import { getLineCounts } from './line-counts';
import { defaultIgnore } from './ignore-defaults';
import type {
  ApiError,
  CommitsResponse,
  LineCountsResponse,
} from '../api/types';

const commitSchema = z.object({
  message: z.string(),
  timestamp: z.number(),
});

const lineCountSchema = z.object({
  file: z.string(),
  lines: z.number(),
});

const commitsResponseSchema = z.object({
  commits: z.array(commitSchema),
});

const lineCountsResponseSchema = z.object({
  counts: z.array(lineCountSchema),
});

const linesQuerySchema = z.object({ ts: z.string() });

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

apiMiddleware.get(
  '/api/commits',
  async (
    req: express.Request<Record<string, never>, CommitsResponse | ApiError>,
    res: express.Response<CommitsResponse | ApiError>,
  ) => {
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
      const gitCommits = await git.log({ fs, dir, ref: branch });
      const commits = gitCommits.map((c) => ({
        message: c.commit.message,
        timestamp: c.commit.committer.timestamp,
      }));
      const parsed = commitsResponseSchema.safeParse({ commits });
      if (!parsed.success) {
        res.status(500).json({ error: 'Invalid data' });
        return;
      }
      res.json(parsed.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

apiMiddleware.get(
  '/api/lines',
  async (
    req: express.Request<Record<string, never>, LineCountsResponse | ApiError, undefined, { ts?: string }>,
    res: express.Response<LineCountsResponse | ApiError>,
  ) => {
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
      const query = linesQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ error: 'Invalid query' });
        return;
      }
      const ts = Number(query.data.ts) / 1000;
      const ignore = ignorePatterns(app);

      const commits = await git.log({ fs, dir, ref: branch });
      const commit = commits.find((c) => c.commit.committer.timestamp <= ts);
      if (!commit) {
        res.status(404).json({ error: 'Commit not found' });
        return;
      }
      const counts = await getLineCounts({ dir, ref: commit.oid, ignore });
      const parsed = lineCountsResponseSchema.safeParse({ counts });
      if (!parsed.success) {
        res.status(500).json({ error: 'Invalid data' });
        return;
      }
      res.json(parsed.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);
