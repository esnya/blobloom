import type { Plugin } from 'vite';
import type { NextHandleFunction } from 'connect';
import { createApiMiddleware } from './apiMiddleware';
import express from 'express';

export default function viteExpress(): Plugin {
  return {
    name: 'vite-express',
    async configureServer(server) {
      const router = await createApiMiddleware();
      const app = express();
      app.use(router);
      server.middlewares.use(app as unknown as NextHandleFunction);
    },
  };
}
