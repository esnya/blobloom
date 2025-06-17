/** @jest-environment node */
import express from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import WebSocket from 'ws';
import { setupLineCountWs } from '../../server/ws';

it('handles upgrades before other listeners', async () => {
  const app = express();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const server = createServer(app);
  // other listener that destroys the socket
  server.on('upgrade', (_req, socket) => {
    socket.destroy();
  });
  setupLineCountWs(app, server);
  await new Promise((resolve) => server.listen(0, resolve as () => void));
  const { port } = server.address() as AddressInfo;

  await expect(
    new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws/line-counts`);
      ws.on('open', () => {
        ws.terminate();
        resolve();
      });
      ws.on('error', reject);
    }),
  ).resolves.toBeUndefined();

  server.close();
});
