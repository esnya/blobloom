import express from 'express';
import { Command } from 'commander';
import { createServer } from 'http';
import { apiMiddleware } from './api-middleware';
import { appSettings } from './app-settings';
import { defaultIgnore } from './ignore-defaults';
import { setupLineCountWs } from './ws';

const collect = (val: string, acc: string[]): string[] => acc.concat(val.split(','));

const program = new Command();
program
  .option('-r, --repo <path>', 'git repository path', process.env.BLOBLOOM_REPO)
  .option('-b, --branch <name>', 'branch to inspect', process.env.BLOBLOOM_BRANCH)
  .option('-H, --host <host>', 'host name to listen on', process.env.BLOBLOOM_HOST ?? 'localhost')
  .option(
    '-p, --port <number>',
    'port to listen on',
    (v) => Number(v),
    process.env.BLOBLOOM_PORT ? Number(process.env.BLOBLOOM_PORT) : 3000,
  )
  .option(
    '-i, --ignore <pattern>',
    'glob pattern to ignore',
    collect,
    process.env.BLOBLOOM_IGNORE
      ? process.env.BLOBLOOM_IGNORE.split(',')
      : [...defaultIgnore],
  );

program.parse();

const { host, port, branch, ignore, repo } = program.opts<{
  host: string;
  port: number;
  branch?: string;
  ignore: string[];
  repo?: string;
}>();

const app = express();
app.set(appSettings.repo.description!, repo);
app.set(appSettings.branch.description!, branch);
app.set(appSettings.ignore.description!, ignore);

app.use(express.static('dist'));
app.use(apiMiddleware);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(app);
setupLineCountWs(app, server);

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
