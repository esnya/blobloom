import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import type { AddressInfo } from 'net';
import express from 'express';
import { apiMiddleware } from '../apiMiddleware';
import { appSettings } from '../appSettings';
import { fetchCommits, fetchLineCounts } from '../client/api';

const author = { name: 'a', email: 'a@example.com' };


describe('server e2e', () => {
  it('serves commits and line counts', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2\n');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'init' });

    const app = express();
    app.set(appSettings.repo.description!, dir);
    app.set(appSettings.branch.description!, 'HEAD');
    app.use(apiMiddleware);
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    const base = `http://localhost:${port}`;
    const commits = await fetchCommits(base);
    const counts = await fetchLineCounts(undefined, base);

    expect(commits[0]!.commit.message).toBe('init\n');
    expect(counts[0]?.file).toBe('a.txt');

    server.close();
  });

  it('responds to branch changes via app settings', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'init' });
    await git.branch({ fs, dir, ref: 'feature' });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'feat: update' });

    const app = express();
    app.set(appSettings.repo.description!, dir);
    app.set(appSettings.branch.description!, 'HEAD');
    app.use(apiMiddleware);
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    const base = `http://localhost:${port}`;
    const commitsHead = await fetchCommits(base);
    expect(commitsHead[0]!.commit.message).toBe('feat: update\n');

    app.set(appSettings.branch.description!, 'feature');
    const commitsFeature = await fetchCommits(base);
    expect(commitsFeature[0]!.commit.message).toBe('init\n');

    server.close();
  });

  it('ignores lock files by default', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'package-lock.json'), '0');
    await git.add({ fs, dir, filepath: 'package-lock.json' });
    await git.commit({ fs, dir, author, message: 'init' });

    const app = express();
    app.set(appSettings.repo.description!, dir);
    app.set(appSettings.branch.description!, 'HEAD');
    app.use(apiMiddleware);
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    const base = `http://localhost:${port}`;
    await expect(fetchLineCounts(undefined, base)).rejects.toThrow('No line counts');

    server.close();
  });
});
