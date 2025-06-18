import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Socket } from 'node:net';
import express from 'express';
import fs from 'fs';
import * as git from 'isomorphic-git';
import { getLineCounts, getRenameMap } from './line-counts';
import { repoDir, ignorePatterns } from './repo-config';
import { appSettings } from './app-settings';

export interface LineCountsRequest {
  timestamp: number;
  parent?: string;
  token?: number;
}

const COMMITS_AROUND = 15;

export const setupLineCountWs = (app: express.Application, server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.prependListener(
    'upgrade',
    (req: IncomingMessage, socket: Socket, head: Buffer) => {
      if (req.url?.startsWith('/ws/line-counts')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    },
  );

  wss.on('connection', (ws: WebSocket) => {
    let previous: string | undefined;
    let processing = false;
    let next: LineCountsRequest | null = null;
    let rangeStart: number | null = null;
    let rangeEnd: number | null = null;
    let rangeSent = false;

    const run = async (): Promise<void> => {
      if (processing || !next) return;
      const { timestamp, parent, token } = next;
      next = null;
      processing = true;
      try {
        const dir = repoDir(app);
        const ignore = ignorePatterns(app);
        const branch =
          (app.get(appSettings.branch.description!) as string | undefined) ??
          'HEAD';
        const logs = await git.log({ fs, dir, ref: branch });
        const index = logs.findIndex(
          (c) => c.commit.committer.timestamp * 1000 <= timestamp,
        );
        const commitIndex = index === -1 ? logs.length - 1 : index;
        const id = logs[commitIndex]!.oid;

        await git.resolveRef({ fs, dir, ref: id });
        const parentId = previous ?? parent;
        previous = id;
        const options = { dir, ref: id, ignore } as {
          dir: string;
          ref: string;
          ignore: string[];
          parent?: string;
        };
        if (parentId) options.parent = parentId;
        const counts = await getLineCounts(options);
        const renames = parentId
          ? await getRenameMap({ dir, ref: id, parent: parentId, ignore })
          : undefined;
        const commitStart = commitIndex === -1 ? 0 : Math.max(commitIndex - COMMITS_AROUND, 0);
        const commitEnd =
          commitIndex === -1
            ? Math.min(COMMITS_AROUND + 1, logs.length)
            : Math.min(commitIndex + COMMITS_AROUND + 1, logs.length);
        const commits = logs.slice(commitStart, commitEnd).map((c) => ({
          id: c.oid,
          message: c.commit.message,
          timestamp: c.commit.committer.timestamp,
        }));

        if (!rangeSent) {
          if (rangeStart === null || rangeEnd === null) {
            const rangeLogs = await git.log({ fs, dir, ref: branch });
            const oldest = rangeLogs[rangeLogs.length - 1];
            rangeStart = oldest ? oldest.commit.committer.timestamp * 1000 : 0;
            const newest = rangeLogs[0];
            rangeEnd = newest ? newest.commit.committer.timestamp * 1000 : 0;
          }
          ws.send(
            JSON.stringify({ type: 'range', start: rangeStart, end: rangeEnd, token }),
          );
          rangeSent = true;
        }
        const payload = renames
          ? { type: 'data', counts, renames, token, commits }
          : { type: 'data', counts, token, commits };
        ws.send(JSON.stringify(payload));
        ws.send(JSON.stringify({ type: 'done', token }));
      } catch (error) {
        ws.send(
          JSON.stringify({ type: 'error', error: (error as Error).message, token }),
        );
      } finally {
        processing = false;
        void run();
      }
    };

    ws.on('message', (data: WebSocket.RawData) => {
      const raw =
        typeof data === 'string'
          ? data
          : Array.isArray(data)
            ? Buffer.concat(data).toString('utf8')
            : Buffer.from(data).toString('utf8');
      next = JSON.parse(raw) as LineCountsRequest;
      void run();
    });
  });
};

