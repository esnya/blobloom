import type { Plugin } from 'vite';
import type { NextHandleFunction } from 'connect';
import { createApiMiddleware } from './apiMiddleware';

export default function viteExpress(): Plugin {
  return {
    name: 'vite-express',
    async configureServer(server) {
      const middleware = await createApiMiddleware();
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      server.middlewares.use(middleware as unknown as NextHandleFunction);
    },
  };
}
