/** @jest-environment node */
import express from 'express';
import { createServer, type IncomingMessage } from 'http';
import type { Socket } from 'node:net';
import { setupLineCountWs } from '../../server/ws';

describe('setupLineCountWs', () => {
  it('ignores other upgrade paths', () => {
    const app = express();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = createServer(app);
    setupLineCountWs(app, server);
    const otherHandler = jest.fn();
    server.on('upgrade', otherHandler);

    const req = { url: '/other' } as unknown as IncomingMessage;
    const socket = { destroy: jest.fn() } as unknown as Socket;

    server.emit('upgrade', req, socket, Buffer.alloc(0));

    expect(otherHandler).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(socket.destroy).not.toHaveBeenCalled();
  });
});
