import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Socket } from 'node:net';
import express from 'express';
import path from 'path';
import fs from 'fs';
import * as git from 'isomorphic-git';
import { appSettings } from './app-settings';
import { defaultIgnore } from './ignore-defaults';
import { getLineCounts, getRenameMap } from './line-counts';

export interface LineCountsRequest {
  id: string;
  parent?: string;
}

export const setupLineCountWs = (app: express.Application, server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (req.url?.startsWith('/ws/lines')) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: WebSocket.RawData) => {
      void (async () => {
        try {
          const raw =
            typeof data === 'string'
              ? data
              : Array.isArray(data)
                ? Buffer.concat(data).toString('utf8')
                : Buffer.from(data).toString('utf8');
          const message = JSON.parse(raw) as LineCountsRequest;
          const dir = path.resolve(
            (app.get(appSettings.repo.description!) as string | undefined) ?? process.cwd(),
          );
          const ignore =
            (app.get(appSettings.ignore.description!) as string[] | undefined) ?? [...defaultIgnore];

          await git.resolveRef({ fs, dir, ref: message.id });
          const options = { dir, ref: message.id, ignore } as {
            dir: string;
            ref: string;
            ignore: string[];
            parent?: string;
          };
          if (message.parent) options.parent = message.parent;
          const counts = await getLineCounts(options);
          const renames = message.parent
            ? await getRenameMap({ dir, ref: message.id, parent: message.parent, ignore })
            : undefined;
          const payload = renames ? { counts, renames } : { counts };
          ws.send(JSON.stringify(payload));
        } catch (error) {
          ws.send(JSON.stringify({ error: (error as Error).message }));
        }
      })();
    });
  });
};
