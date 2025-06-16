import fs from 'fs';
import os from 'os';
import path from 'path';
import * as git from 'isomorphic-git';

jest.mock('diff-sequences', () => {
  const actual = jest.requireActual('diff-sequences') as unknown as {
    default: unknown;
  };
  return { default: actual.default };
});

const author = { name: 'a', email: 'a@example.com' };

describe('line-counts module', () => {
  it('handles diff-sequences CJS default export', async () => {
    const { getLineCounts } = await import('../server/line-counts');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    await git.init({ fs, dir });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'init' });
    await fs.promises.writeFile(path.join(dir, 'a.txt'), '1\n2');
    await git.add({ fs, dir, filepath: 'a.txt' });
    await git.commit({ fs, dir, author, message: 'update' });
    const logs = await git.log({ fs, dir, ref: 'HEAD', depth: 2 });
    const counts = await getLineCounts({
      dir,
      ref: logs[0]!.oid,
      parent: logs[1]!.oid,
    });
    const entry = counts.find((c) => c.file === 'a.txt');
    expect(entry?.added).toBe(1);
  });
});
