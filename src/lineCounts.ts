import * as git from 'isomorphic-git';
import fs from 'fs';
import { minimatch } from 'minimatch';

export const MAX_BLOB_SIZE = 10 * 1024 * 1024; // 10 MiB

const isBinary = (buf: Buffer): boolean => {
  const len = Math.min(buf.length, 1000);
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
};

export interface LineCount {
  file: string;
  lines: number;
}

export const getLineCounts = async ({
  dir,
  ref,
  ignore = [],
}: {
  dir: string;
  ref: string;
  ignore?: string[];
}): Promise<LineCount[]> => {
  const oid = await git.resolveRef({ fs, dir, ref });
  const files = await git.listFiles({ fs, dir, ref });
  const counts: LineCount[] = [];
  for (const file of files) {
    if (ignore.some((p) => minimatch(file, p))) continue;
    const { blob } = await git.readBlob({ fs, dir, oid, filepath: file });
    if (blob.length > MAX_BLOB_SIZE) continue;
    const buffer = Buffer.from(blob);
    if (isBinary(buffer)) continue;
    const content = buffer.toString('utf8').trimEnd();
    counts.push({ file, lines: content.split(/\r?\n/).length });
  }
  counts.sort((a, b) => b.lines - a.lines);
  return counts;
};
