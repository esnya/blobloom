import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import { resolveBranch } from '../../server/resolveBranch';

const author = { name: 'a', email: 'a@example.com' };

describe('resolveBranch', () => {
  it('returns given branch', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    try {
      await git.init({ fs, dir });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'init' });
      await git.branch({ fs, dir, ref: 'feature' });
      await expect(resolveBranch(dir, 'feature')).resolves.toBe('feature');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('prefers main/master/trunk when branch not specified', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    try {
      await git.init({ fs, dir, defaultBranch: 'main' });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'init' });
      await git.branch({ fs, dir, ref: 'dev' });
      await expect(resolveBranch(dir, undefined)).resolves.toBe('main');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns first branch when no preferred names exist', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    try {
      await git.init({ fs, dir, defaultBranch: 'x' });
      await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
      await git.add({ fs, dir, filepath: 'a.txt' });
      await git.commit({ fs, dir, author, message: 'init' });
      await git.branch({ fs, dir, ref: 'y' });
      const branches = await git.listBranches({ fs, dir });
      await expect(resolveBranch(dir, undefined)).resolves.toBe(branches[0]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
