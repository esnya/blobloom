import type { Plugin } from 'vite';
import { createApp } from './app';

export default function viteExpress(): Plugin {
  return {
    name: 'vite-express',
    async configureServer(server) {
      const app = await createApp({ repo: process.cwd(), serveStatic: false });
      server.middlewares.use(app);
    },
  };
}
