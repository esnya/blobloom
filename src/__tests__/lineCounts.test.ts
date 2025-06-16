import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import { getLineCounts, getRenameMap } from '../server/line-counts';
import { defaultIgnore } from '../server/ignore-defaults';

const author = { name: 'a', email: 'a@example.com' };

describe('getLineCounts', () => {
  it('counts lines in repo', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2\n');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'init' });

    const counts = await getLineCounts({ dir, ref: 'HEAD' });
    expect(counts.find((c) => c.file === 'a.txt')?.lines).toBe(2);
  });

  it('ignores binary files', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(
      path.join(dir, 'b.bin'),
      Buffer.from([0, 1, 2, 3]),
    );
    await git.add({ fs, dir, filepath: 'b.bin' });
    await git.commit({ fs, dir, author, message: 'init' });

    const counts = await getLineCounts({ dir, ref: 'HEAD' });
    expect(counts.find((c) => c.file === 'b.bin')).toBeUndefined();
  });

  it('ignores files matched by patterns', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'package-lock.json'), '0');
    await git.add({ fs, dir, filepath: 'package-lock.json' });
    await git.commit({ fs, dir, author, message: 'init' });

    const counts = await getLineCounts({ dir, ref: 'HEAD', ignore: defaultIgnore });
    expect(counts.find((c) => c.file === 'package-lock.json')).toBeUndefined();
  });

  it('detects renames', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'init' });
    await fs.promises.rename(path.join(dir, 'a.txt'), path.join(dir, 'b.txt'));
    await git.remove({ fs, dir, filepath: 'a.txt' });
    await git.add({ fs, dir, filepath: 'b.txt' });
    await git.commit({ fs, dir, author, message: 'rename' });

    const logs = await git.log({ fs, dir, ref: 'HEAD', depth: 2 });
    const renames = await getRenameMap({ dir, ref: logs[0]!.oid, parent: logs[1]!.oid });
    expect(renames['b.txt']).toBe('a.txt');
  });
});
