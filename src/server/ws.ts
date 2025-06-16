import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Socket } from 'node:net';
import express from 'express';
import fs from 'fs';
import * as git from 'isomorphic-git';
import { getLineCounts, getRenameMap } from './line-counts';
import { repoDir, ignorePatterns } from './repo-config';

export interface LineCountsRequest {
  id: string;
  parent?: string;
  token?: number;
}

export const setupLineCountWs = (app: express.Application, server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.prependListener(
    'upgrade',
    (req: IncomingMessage, socket: Socket, head: Buffer) => {
      if (req.url?.startsWith('/ws/lines')) {
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

    const run = async (): Promise<void> => {
      if (processing || !next) return;
      const { id, parent, token } = next;
      next = null;
      processing = true;
      try {
        const dir = repoDir(app);
        const ignore = ignorePatterns(app);

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
        const payload = renames ? { counts, renames, token } : { counts, token };
        ws.send(JSON.stringify(payload));
      } catch (error) {
        ws.send(
          JSON.stringify({ error: (error as Error).message, token }),
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
