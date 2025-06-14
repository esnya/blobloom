import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';
import { getLineCounts, MAX_BLOB_SIZE } from '../lineCounts';

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

  it('skips blobs larger than MAX_BLOB_SIZE', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    const large = Buffer.alloc(MAX_BLOB_SIZE + 1, 'a');
    await fs.promises.writeFile(path.join(dir, 'large.txt'), large);
    await git.add({ fs, dir, filepath: 'large.txt' });
    await git.commit({ fs, dir, author, message: 'init' });

    const counts = await getLineCounts({ dir, ref: 'HEAD' });
    expect(counts.find((c) => c.file === 'large.txt')).toBeUndefined();
  });
});
