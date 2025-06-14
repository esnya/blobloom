import express from 'express';
import * as git from 'isomorphic-git';
import fs from 'fs';
import { Command } from 'commander';
import path from 'path';
import { getLineCounts, LineCount } from './lineCounts';

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

const commits = await git.log({ fs, dir: repoDir, ref: branch });
const lineCounts: LineCount[] = await getLineCounts({ dir: repoDir, ref: branch });

const app = express();

app.use(express.static('public'));

app.get('/api/commits', (_, res) => {
  res.json(commits);
});

app.get('/api/lines', async (req, res) => {
  const tsParam = req.query.ts as string | undefined;
  if (tsParam) {
    const ts = Number(tsParam) / 1000;
    const commit = commits.find(
      (c) => c.commit.committer.timestamp <= ts,
    );
    if (!commit) {
      res.status(404).json({ error: 'Commit not found' });
      return;
    }
    try {
      const counts = await getLineCounts({ dir: repoDir, ref: commit.oid });
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.json(lineCounts);
  }
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
