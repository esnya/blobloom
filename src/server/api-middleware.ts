import express from 'express';
import { z } from 'zod';
import { appSettings } from './app-settings';
import * as git from 'isomorphic-git';
import fs from 'fs';
import { getLineCounts, getRenameMap } from './line-counts';
import { resolveRepoDir, ignorePatterns } from './repo-config';
import { resolveBranch } from './resolveBranch';
import type {
  ApiError,
  CommitsResponse,
  LineCountsResponse,
} from '../api/types';

const commitSchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.number(),
});

const lineCountSchema = z.object({
  file: z.string(),
  lines: z.number(),
  added: z.number(),
  removed: z.number(),
});

const commitsResponseSchema = z.object({
  commits: z.array(commitSchema),
});

const lineCountsResponseSchema = z.object({
  counts: z.array(lineCountSchema),
  commits: z.array(commitSchema),
  renames: z.record(z.string(), z.string()).optional(),
});

const linesQuerySchema = z.object({ parent: z.string().optional() });


export const apiMiddleware = express.Router();

apiMiddleware.get(
  '/api/commits',
  async (
    req: express.Request<Record<string, never>, CommitsResponse | ApiError>,
    res: express.Response<CommitsResponse | ApiError>,
  ) => {
    const app = req.app;
    let dir: string;
    try {
      dir = resolveRepoDir(app);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return;
    }
    try {
      const branch = await resolveBranch(
        dir,
        app.get(appSettings.branch.description!) as string | undefined,
      );
      const gitCommits = await git.log({ fs, dir, ref: branch });
      const commits = gitCommits.map((c) => ({
        id: c.oid,
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
  '/api/commits/:commitId/lines',
  async (
    req: express.Request<{ commitId: string }, LineCountsResponse | ApiError, undefined, { parent?: string }>,
    res: express.Response<LineCountsResponse | ApiError>,
  ) => {
    const app = req.app;
    let dir: string;
    try {
      dir = resolveRepoDir(app);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return;
    }
    try {
      const params = linesQuerySchema.safeParse(req.query);
      if (!params.success) {
        res.status(400).json({ error: 'Invalid query' });
        return;
      }
      const ignore = ignorePatterns(app);

      const ts = Number(req.params.commitId);
      const branch = await resolveBranch(
        dir,
        app.get(appSettings.branch.description!) as string | undefined,
      );
      const logs = await git.log({ fs, dir, ref: branch });
      const index = logs.findIndex((c) => c.commit.committer.timestamp * 1000 <= ts);
      const commitId = (index === -1 ? logs[logs.length - 1] : logs[index])!.oid;

      await git.resolveRef({ fs, dir, ref: commitId });
      const options = { dir, ref: commitId, ignore } as {
        dir: string;
        ref: string;
        ignore: string[];
        parent?: string;
      };
      if (params.data.parent) options.parent = params.data.parent;
      const counts = await getLineCounts(options);
      const renames = params.data.parent
        ? await getRenameMap({
            dir,
            ref: commitId,
            parent: params.data.parent,
            ignore,
          })
        : undefined;
      const payload = renames ? { counts, renames, commits: [] } : { counts, commits: [] };
      const parsed = lineCountsResponseSchema.safeParse(payload);
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
