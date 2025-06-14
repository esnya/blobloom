import * as git from 'isomorphic-git';
import fs from 'fs';

export interface LineCount {
  file: string;
  lines: number;
}

export const getLineCounts = async ({
  dir,
  ref,
}: {
  dir: string;
  ref: string;
}): Promise<LineCount[]> => {
  const oid = await git.resolveRef({ fs, dir, ref });
  const files = await git.listFiles({ fs, dir, ref });
  const counts: LineCount[] = [];
  for (const file of files) {
    const { blob } = await git.readBlob({ fs, dir, oid, filepath: file });
    const content = Buffer.from(blob).toString('utf8').trimEnd();
    counts.push({ file, lines: content.split(/\r?\n/).length });
  }
  counts.sort((a, b) => b.lines - a.lines);
  return counts;
};
