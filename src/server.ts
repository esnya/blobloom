import express from 'express';
import * as git from 'isomorphic-git';
import fs from 'fs';
import { Command } from 'commander';
import path from 'path';

const program = new Command();
program
  .requiredOption('-r, --repo <path>', 'path to the git repository')
  .option('-b, --branch <name>', 'branch to inspect')
  .option('-H, --host <host>', 'host name to listen on', 'localhost')
  .option('-p, --port <number>', 'port to listen on', (v) => Number(v), 3000);

program.parse();

const { repo, host, port, branch: inputBranch } = program.opts<{
  repo: string;
  host: string;
  port: number;
  branch?: string;
}>();

const repoDir = path.resolve(repo);

if (!fs.existsSync(path.join(repoDir, '.git'))) {
  console.error(`${repoDir} is not a git repository.`);
  process.exit(1);
}

const branches = await git.listBranches({ fs, dir: repoDir });
let branch = inputBranch;
if (!branch) {
  branch =
    ['main', 'master', 'trunk'].find((b) => branches.includes(b)) ??
    branches[0];
}
if (!branch) {
  console.error('No branch found.');
  process.exit(1);
}

const app = express();

app.use(express.static('public'));

app.get('/api/commits', async (_, res) => {
  try {
    const commits = await git.log({ fs, dir: repoDir, ref: branch });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
