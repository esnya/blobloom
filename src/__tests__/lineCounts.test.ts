import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import { getLineCounts } from '../server/line-counts';
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
});
