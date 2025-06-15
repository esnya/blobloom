import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import type { AddressInfo } from 'net';
import { test, expect } from '@playwright/test';
import { createApp } from '../src/app.js';

const author = { name: 'a', email: 'a@example.com' };

test('loads page with play button', async ({ page }) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
  await git.init({ fs, dir });
  await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2\n');
  await git.add({ fs, dir, filepath: 'a.txt' });
  await git.commit({ fs, dir, author, message: 'init' });

  const app = await createApp({ repo: dir, branch: 'HEAD' });
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  await page.goto(`http://localhost:${port}`);
  await expect(page.locator('text=Play')).toBeVisible();

  server.close();
});
