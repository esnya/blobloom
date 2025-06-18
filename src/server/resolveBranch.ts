import * as git from 'isomorphic-git';
import fs from 'fs';

export const resolveBranch = async (
  dir: string,
  inputBranch: string | undefined,
): Promise<string> => {
  const branches = await git.listBranches({ fs, dir });
  let branch = inputBranch;
  if (!branch) {
    branch = ['main', 'master', 'trunk'].find((b) => branches.includes(b)) ?? branches[0];
  }
  if (!branch) {
    throw new Error('No branch found.');
  }
  return branch;
};
