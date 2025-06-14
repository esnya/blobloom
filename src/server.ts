import { Command } from 'commander';
import { createApp } from './app';

const defaultIgnore = [
  '**/*.lock',
  '**/*lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'Cargo.lock',
  'go.sum',
  'Pipfile.lock',
  'composer.lock',
];

const collect = (val: string, acc: string[]): string[] => acc.concat(val.split(','));

const program = new Command();
program
  .option('-r, --repo <path>', 'path to the git repository', process.cwd())
  .option('-b, --branch <name>', 'branch to inspect')
  .option('-H, --host <host>', 'host name to listen on', 'localhost')
  .option('-p, --port <number>', 'port to listen on', (v) => Number(v), 3000)
  .option('-i, --ignore <pattern>', 'glob pattern to ignore', collect, [...defaultIgnore]);

program.parse();

const { repo, host, port, branch, ignore } = program.opts<{
  repo: string;
  host: string;
  port: number;
  branch?: string;
  ignore: string[];
}>();

const app = await createApp({ repo, branch, ignore });

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
