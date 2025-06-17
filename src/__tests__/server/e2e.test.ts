/* eslint-disable @typescript-eslint/no-misused-promises */
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import type { AddressInfo } from 'net';
import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import { apiMiddleware } from '../../server/api-middleware';
import { appSettings } from '../../server/app-settings';
import { setupLineCountWs } from '../../server/ws';
import { fetchCommits, fetchLineCounts } from '../../client/api';

const author = { name: 'a', email: 'a@example.com' };


describe('server e2e', () => {
  const originalWebSocket = global.WebSocket;

  beforeAll(() => {
    global.WebSocket = WebSocket as unknown as typeof global.WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });
  it('serves commits and line counts', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const app = express();
    const server = createServer(app);
    try {
      await git.init({ fs, dir });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2\n');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'init' });

      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      app.use(apiMiddleware);
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;

      const base = `http://localhost:${port}`;
      const commits = await fetchCommits(base);
      const { counts } = await fetchLineCounts(commits[0]!.timestamp * 1000, base);

      expect(commits[0]!.message).toBe('init\n');
      expect(counts[0]?.file).toBe('a.txt');
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('responds to branch changes via app settings', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const app = express();
    const server = createServer(app);
    try {
      await git.init({ fs, dir });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'init' });
      await git.branch({ fs, dir, ref: 'feature' });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'feat: update' });

      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      app.use(apiMiddleware);
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;

      const base = `http://localhost:${port}`;
      const commitsHead = await fetchCommits(base);
      expect(commitsHead[0]!.message).toBe('feat: update\n');

      app.set(appSettings.branch.description!, 'feature');
      const commitsFeature = await fetchCommits(base);
      expect(commitsFeature[0]!.message).toBe('init\n');
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ignores lock files by default', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const app = express();
    const server = createServer(app);
    try {
      await git.init({ fs, dir });
      await fs.promises.writeFile(path.join(dir, 'package-lock.json'), '0');
      await git.add({ fs, dir, filepath: 'package-lock.json' });
      await git.commit({ fs, dir, author, message: 'init' });

      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      app.use(apiMiddleware);
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;

      const base = `http://localhost:${port}`;
      const commitTs = (await git.log({ fs, dir, ref: 'HEAD' }))[0]!.commit.committer.timestamp * 1000;
      await expect(fetchLineCounts(commitTs, base)).rejects.toThrow('No line counts');
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns rename mapping', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const app = express();
    const server = createServer(app);
    try {
      await git.init({ fs, dir });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'init' });
      const parent = (await git.log({ fs, dir, ref: 'HEAD' }))[0]!.oid;
      await fs.promises.rename(path.join(dir, 'a.txt'), path.join(dir, 'b.txt'));
      await git.remove({ fs, dir, filepath: 'a.txt' });
      await git.add({ fs, dir, filepath: 'b.txt' });
      await git.commit({ fs, dir, author, message: 'rename' });

      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      app.use(apiMiddleware);
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;

      const base = `http://localhost:${port}`;
      const headTs = (await git.log({ fs, dir, ref: 'HEAD' }))[0]!.commit.committer.timestamp * 1000;
      const result = await fetchLineCounts(headTs, base, parent);

      expect(result.renames?.['b.txt']).toBe('a.txt');
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
