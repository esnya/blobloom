import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import type { AddressInfo } from 'net';
import express from 'express';
import { createApiMiddleware } from '../apiMiddleware';
import { fetchCommits, fetchLineCounts, JsonFetcher } from '../client/api';

const author = { name: 'a', email: 'a@example.com' };

const makeJsonFetcher = (port: number): JsonFetcher => {
  return (input: string) => fetch(`http://localhost:${port}${input}`).then((r) => r.json());
};

describe('server e2e', () => {
  it('serves commits and line counts', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2\n');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'init' });

    const app = express();
    app.use(await createApiMiddleware({ repo: dir, branch: 'HEAD' }));
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    const json = makeJsonFetcher(port);
    const commits = await fetchCommits(json);
    const counts = await fetchLineCounts(json);

    expect(commits[0].commit.message).toBe('init\n');
    expect(counts[0]?.file).toBe('a.txt');

    server.close();
  });
});
