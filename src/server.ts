import express from 'express';
import { Command } from 'commander';
import { apiMiddleware } from './apiMiddleware';

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
  .option('-b, --branch <name>', 'branch to inspect')
  .option('-H, --host <host>', 'host name to listen on', 'localhost')
  .option('-p, --port <number>', 'port to listen on', (v) => Number(v), 3000)
  .option('-i, --ignore <pattern>', 'glob pattern to ignore', collect, [...defaultIgnore]);

program.parse();

const { host, port, branch, ignore } = program.opts<{
  host: string;
  port: number;
  branch?: string;
  ignore: string[];
}>();

const app = express();
app.set('branch', branch);
app.set('ignore', ignore);
app.use(express.static('dist'));
app.use(apiMiddleware);

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
