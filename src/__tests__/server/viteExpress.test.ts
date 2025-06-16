/** @jest-environment node */
import viteExpress from '../../server/vite-express';

jest.mock('../../server/ws', () => ({
  setupLineCountWs: jest.fn(),
}));

import { setupLineCountWs } from '../../server/ws';

interface MockServer {
  middlewares: { use: jest.Mock };
  httpServer: unknown;
}

const createServer = (): MockServer => ({
  middlewares: { use: jest.fn() },
  httpServer: {},
});

describe('viteExpress plugin', () => {
  it('adds WebSocket support', () => {
    const server = createServer();
    const plugin = viteExpress();
    (plugin.configureServer as unknown as (s: MockServer) => void)(server);
    expect(setupLineCountWs).toHaveBeenCalledWith(expect.anything(), server.httpServer);
  });
});
