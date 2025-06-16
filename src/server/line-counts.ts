import * as git from 'isomorphic-git';
import fs from 'fs';
import { minimatch } from 'minimatch';

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
    const buffer = Buffer.from(blob);
    if (isBinary(buffer)) continue;
    const content = buffer.toString('utf8').trimEnd();
    counts.push({ file, lines: content.split(/\r?\n/).length });
  }
  counts.sort((a, b) => b.lines - a.lines);
  return counts;
};

export const getRenameMap = async ({
  dir,
  ref,
  parent,
  ignore = [],
}: {
  dir: string;
  ref: string;
  parent: string;
  ignore?: string[];
}): Promise<Record<string, string>> => {
  const oid = await git.resolveRef({ fs, dir, ref });
  const parentOid = await git.resolveRef({ fs, dir, ref: parent });
  const files = await git.listFiles({ fs, dir, ref });
  const parentFiles = await git.listFiles({ fs, dir, ref: parent });
  const parentMap = new Map<string, string>();
  for (const file of parentFiles) {
    if (ignore.some((p) => minimatch(file, p))) continue;
    const { oid: blobOid } = await git.readBlob({ fs, dir, oid: parentOid, filepath: file });
    parentMap.set(blobOid, file);
  }
  const renames: Record<string, string> = {};
  const parentSet = new Set(parentFiles);
  for (const file of files) {
    if (ignore.some((p) => minimatch(file, p))) continue;
    if (parentSet.has(file)) continue;
    const { oid: blobOid } = await git.readBlob({ fs, dir, oid, filepath: file });
    const prev = parentMap.get(blobOid);
    if (prev && prev !== file) {
      renames[file] = prev;
    }
  }
  return renames;
};
