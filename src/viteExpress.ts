import type { Plugin } from 'vite';
import { apiMiddleware } from './apiMiddleware';

export default function viteExpress(): Plugin {
  return {
    name: 'vite-express',
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}
