import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import type { AddressInfo } from 'net';
import { test, expect } from '@playwright/test';
import express from 'express';
import { apiMiddleware } from '../src/apiMiddleware';
import { appSettings } from '../src/appSettings';

const author = { name: 'a', email: 'a@example.com' };

test('serves index page', async ({ page }) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
  await git.init({ fs, dir });
  await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2\n');
  await git.add({ fs, dir, filepath: 'a.txt' });
  await git.commit({ fs, dir, author, message: 'init' });

  const app = express();
  app.set(appSettings.repo.description!, dir);
  app.set(appSettings.branch.description!, 'HEAD');
  app.use(express.static('dist'));
  app.use(apiMiddleware);
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  const response = await page.goto(`http://localhost:${port}`);
  expect(response?.ok()).toBe(true);

  server.close();
});
