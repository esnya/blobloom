import type { Plugin } from 'vite';
import { createApiMiddleware } from './apiMiddleware';

export default function viteExpress(): Plugin {
  return {
    name: 'vite-express',
    async configureServer(server) {
      server.middlewares.use(await createApiMiddleware());
    },
  };
}
