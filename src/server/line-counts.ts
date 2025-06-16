import * as git from 'isomorphic-git';
import fs from 'fs';
import { minimatch } from 'minimatch';
import diff from 'diff-sequences';

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
  added: number;
  removed: number;
}

const diffCounts = (
  a: string[],
  b: string[],
): { added: number; removed: number } => {
  let common = 0;
  diff(
    a.length,
    b.length,
    (ai, bi) => a[ai] === b[bi],
    (nCommon) => {
      common += nCommon;
    },
  );
  return { added: b.length - common, removed: a.length - common };
};

export const getLineCounts = async ({
  dir,
  ref,
  ignore = [],
  parent,
}: {
  dir: string;
  ref: string;
  ignore?: string[];
  parent?: string;
}): Promise<LineCount[]> => {
  const oid = await git.resolveRef({ fs, dir, ref });
  const files = await git.listFiles({ fs, dir, ref });
  const counts: LineCount[] = [];
  const parentOid = parent ? await git.resolveRef({ fs, dir, ref: parent }) : undefined;
  const parentCache = new Map<string, string[]>();
  if (parentOid) {
    const parentFiles = await git.listFiles({ fs, dir, ref: parent });
    for (const file of parentFiles) {
      if (ignore.some((p) => minimatch(file, p))) continue;
      const { blob } = await git.readBlob({ fs, dir, oid: parentOid, filepath: file });
      const buf = Buffer.from(blob);
      if (isBinary(buf)) continue;
      parentCache.set(file, buf.toString('utf8').trimEnd().split(/\r?\n/));
    }
  }
  for (const file of files) {
    if (ignore.some((p) => minimatch(file, p))) continue;
    const { blob } = await git.readBlob({ fs, dir, oid, filepath: file });
    const buffer = Buffer.from(blob);
    if (isBinary(buffer)) continue;
    const lines = buffer.toString('utf8').trimEnd().split(/\r?\n/);
    const prev = parentCache.get(file);
    let added = 0;
    let removed = 0;
    if (prev) {
      ({ added, removed } = diffCounts(prev, lines));
    } else if (parent) {
      added = lines.length;
    }
    counts.push({ file, lines: lines.length, added, removed });
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
