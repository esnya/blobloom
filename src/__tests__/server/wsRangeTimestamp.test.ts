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

describe('setupLineCountWs timestamp range', () => {
  it('sends timestamps for start and end', async () => {
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
      const logs = await git.log({ fs, dir, ref: 'HEAD' });
      const oldest = logs[logs.length - 1]!.commit.committer.timestamp * 1000;
      const newest = logs[0]!.commit.committer.timestamp * 1000;
      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;
      await expect(
        new Promise<{ start: number; end: number }>((resolve, reject) => {
          const ws = new WebSocket(`ws://localhost:${port}/ws/line-counts`);
          ws.on('open', () => {
            ws.send(JSON.stringify({ id: 'HEAD' }));
          });
          ws.on('message', (d: WebSocket.RawData) => {
            const text =
              typeof d === 'string'
                ? d
                : Array.isArray(d)
                  ? Buffer.concat(d).toString('utf8')
                  : Buffer.from(d).toString('utf8');
            const data = JSON.parse(text) as { type?: string; start?: number; end?: number };
            if (data.type === 'range' && data.start !== undefined && data.end !== undefined) {
              resolve({ start: data.start, end: data.end });
            }
          });
          ws.on('error', reject);
        })
      ).resolves.toEqual({ start: oldest, end: newest });
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('sends timestamp range only once', async () => {
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
      const logs = await git.log({ fs, dir, ref: 'HEAD' });
      const oldest = logs[logs.length - 1]!.commit.committer.timestamp * 1000;
      const newest = logs[0]!.commit.committer.timestamp * 1000;
      app.set(appSettings.repo.description!, dir);
      app.set(appSettings.branch.description!, 'HEAD');
      setupLineCountWs(app, server);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as AddressInfo;
      const ranges = await new Promise<Array<{ start: number; end: number }>>((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${port}/ws/line-counts`);
        const received: Array<{ start: number; end: number }> = [];
        let done = 0;
        ws.on('open', () => {
          ws.send(JSON.stringify({ id: 'HEAD' }));
          ws.send(JSON.stringify({ id: 'HEAD' }));
        });
        ws.on('message', (d: WebSocket.RawData) => {
          const text =
            typeof d === 'string'
              ? d
              : Array.isArray(d)
                ? Buffer.concat(d).toString('utf8')
                : Buffer.from(d).toString('utf8');
          const data = JSON.parse(text) as { type?: string; start?: number; end?: number; token?: number };
          if (data.type === 'range' && data.start !== undefined && data.end !== undefined) {
            received.push({ start: data.start, end: data.end });
          }
          if (data.type === 'done') {
            done += 1;
            if (done === 2) resolve(received);
          }
        });
        ws.on('error', reject);
      });
      expect(ranges).toEqual([{ start: oldest, end: newest }]);
    } finally {
      server.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
