/** @jest-environment node */
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import express from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import WebSocket from 'ws';
import { appSettings } from '../../server/app-settings';
import { setupLineCountWs } from '../../server/ws';

const author = { name: 'a', email: 'a@example.com' };

describe('setupLineCountWs commit range', () => {
  it('sends commits around given id', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const app = express();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = createServer(app);
    try {
      await git.init({ fs, dir });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'first' });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '2');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'second' });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '3');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'third' });
      const logs = await git.log({ fs, dir, ref: 'HEAD', depth: 3 });
      const middle = logs[1]!.oid;
      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;
      await expect(
        new Promise<string[]>((resolve, reject) => {
          const ws = new WebSocket(`ws://localhost:${port}/ws/line-counts`);
          ws.on('open', () => {
            ws.send(JSON.stringify({ id: middle }));
          });
          ws.on('message', (d: WebSocket.RawData) => {
            const text =
              typeof d === 'string'
                ? d
                : Array.isArray(d)
                  ? Buffer.concat(d).toString('utf8')
                  : Buffer.from(d).toString('utf8');
            const data = JSON.parse(text) as { type?: string; commits?: Array<{ id: string }> };
            if (data.type === 'data' && data.commits) resolve(data.commits.map((c) => c.id));
          });
          ws.on('error', reject);
        })
      ).resolves.toEqual(logs.map((l) => l.oid));
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
