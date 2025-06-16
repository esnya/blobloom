import type { Plugin } from 'vite';
import type { NextHandleFunction } from 'connect';
import { apiMiddleware } from './api-middleware';
import express from 'express';

export default function viteExpress(): Plugin {
  return {
    name: 'vite-express',
    configureServer(server) {
      const app = express();
      app.use(apiMiddleware);
      server.middlewares.use(app as unknown as NextHandleFunction);
    },
  };
}
